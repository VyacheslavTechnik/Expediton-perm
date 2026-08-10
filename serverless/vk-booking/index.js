'use strict';

const crypto = require('crypto');

const VK_API_VERSION = '5.199';
const MAX_BODY_LENGTH = 10000;

function response(statusCode, data, origin) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(data)
  };
}

function clean(value, maxLength) {
  return String(value || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function parseBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
  if (raw.length > MAX_BODY_LENGTH) throw new Error('PAYLOAD_TOO_LARGE');
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

function validate(data) {
  const booking = {
    name: clean(data.name, 80),
    phone: clean(data.phone, 30),
    date: clean(data.date, 10),
    time: clean(data.time, 5),
    guests: clean(data.guests, 30),
    event: clean(data.event, 80),
    wish: clean(data.wish, 500),
    consent: data.consent === true,
    website: clean(data.website, 100)
  };

  if (booking.website) return { spam: true };
  if (booking.name.length < 2) throw new Error('INVALID_NAME');
  if (!/^\+?[0-9 ()-]{7,25}$/.test(booking.phone)) throw new Error('INVALID_PHONE');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) throw new Error('INVALID_DATE');
  if (!/^\d{2}:\d{2}$/.test(booking.time)) throw new Error('INVALID_TIME');
  if (!booking.guests) throw new Error('INVALID_GUESTS');
  if (!booking.consent) throw new Error('CONSENT_REQUIRED');
  return booking;
}

function formatMessage(booking, requestId) {
  const lines = [
    '🍽 Новая заявка на бронирование',
    '',
    `Имя: ${booking.name}`,
    `Телефон: ${booking.phone}`,
    `Дата: ${booking.date}`,
    `Время: ${booking.time}`,
    `Гостей: ${booking.guests}`
  ];
  if (booking.event) lines.push(`Повод: ${booking.event}`);
  if (booking.wish) lines.push(`Пожелания: ${booking.wish}`);
  lines.push('', `Заявка: ${requestId}`, 'Согласие на обработку данных: получено');
  return lines.join('\n');
}

async function sendToVk(message) {
  const token = process.env.VK_TOKEN;
  const peerId = process.env.VK_PEER_ID;
  if (!token || !peerId) throw new Error('SERVER_NOT_CONFIGURED');

  const params = new URLSearchParams({
    access_token: token,
    v: VK_API_VERSION,
    peer_id: peerId,
    random_id: String(crypto.randomInt(1, 2147483647)),
    message
  });
  const result = await fetch('https://api.vk.com/method/messages.send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  if (!result.ok) throw new Error('VK_HTTP_ERROR');
  const payload = await result.json();
  if (payload.error) {
    console.error('VK API error code:', payload.error.error_code);
    throw new Error('VK_API_ERROR');
  }
  return payload.response;
}

module.exports.handler = async function (event) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://vyacheslavtechnik.github.io';
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const corsOrigin = origin === allowedOrigin ? origin : allowedOrigin;

  if (event.httpMethod === 'OPTIONS') return response(204, {}, corsOrigin);
  if (event.httpMethod !== 'POST') return response(405, { ok: false, message: 'Метод не поддерживается' }, corsOrigin);
  if (origin && origin !== allowedOrigin) return response(403, { ok: false, message: 'Источник запроса запрещён' }, corsOrigin);

  try {
    const booking = validate(parseBody(event));
    if (booking.spam) return response(200, { ok: true }, corsOrigin);
    const requestId = `${Date.now().toString(36).toUpperCase()}-${crypto.randomInt(100, 999)}`;
    await sendToVk(formatMessage(booking, requestId));
    return response(200, { ok: true, requestId }, corsOrigin);
  } catch (error) {
    const clientErrors = ['INVALID_NAME', 'INVALID_PHONE', 'INVALID_DATE', 'INVALID_TIME', 'INVALID_GUESTS', 'CONSENT_REQUIRED', 'PAYLOAD_TOO_LARGE', 'SyntaxError'];
    const isClientError = clientErrors.includes(error.message) || error.name === 'SyntaxError';
    if (!isClientError) console.error('Booking delivery failed:', error.message);
    return response(isClientError ? 400 : 502, {
      ok: false,
      message: isClientError ? 'Проверьте правильность заполнения формы' : 'Не удалось отправить заявку. Позвоните нам по телефону.'
    }, corsOrigin);
  }
};

module.exports._test = { clean, validate, formatMessage };
