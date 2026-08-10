$ErrorActionPreference = 'Stop'

Write-Host 'VK community chat finder' -ForegroundColor Cyan
Write-Host 'The access token is used in memory only and is not saved.'

$secureToken = Read-Host 'Paste the community access token' -AsSecureString
$tokenPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)

try {
    $vkToken = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($tokenPointer)
    $response = Invoke-RestMethod `
        -Method Post `
        -Uri 'https://api.vk.com/method/messages.getConversations' `
        -Body @{
            access_token = $vkToken
            v = '5.199'
            count = 200
            filter = 'all'
        }

    if ($response.error) {
        throw "VK API: $($response.error.error_msg) (code $($response.error.error_code))"
    }

    $permissions = Invoke-RestMethod `
        -Method Post `
        -Uri 'https://api.vk.com/method/groups.getTokenPermissions' `
        -Body @{
            access_token = $vkToken
            v = '5.199'
        }

    if ($permissions.error) {
        throw "VK permissions API: $($permissions.error.error_msg) (code $($permissions.error.error_code))"
    }

    Write-Host "`nToken permissions mask: $($permissions.response.mask)" -ForegroundColor DarkGray
    Write-Host "Conversations visible to the community: $($response.response.count)" -ForegroundColor DarkGray

    $allPeers = $response.response.items | ForEach-Object {
        $peerType = $_.conversation.peer.type
        $peerTitle = if ($peerType -eq 'chat') {
            $_.conversation.chat_settings.title
        } elseif ($peerType -eq 'user') {
            "User $($_.conversation.peer.local_id)"
        } else {
            "$peerType $($_.conversation.peer.local_id)"
        }
        [PSCustomObject]@{
            Type = $peerType
            Title = $peerTitle
            Peer_ID = $_.conversation.peer.id
        }
    }

    if ($allPeers) {
        Write-Host "`nAll visible conversations:" -ForegroundColor DarkGray
        $allPeers | Format-Table -AutoSize
    }

    $chats = $response.response.items | Where-Object {
        $_.conversation.peer.type -eq 'chat'
    } | ForEach-Object {
        [PSCustomObject]@{
            Title = $_.conversation.chat_settings.title
            VK_PEER_ID = $_.conversation.peer.id
        }
    }

    if (-not $chats) {
        Write-Host 'No chats found in history. Trying VK Long Poll events.' -ForegroundColor Yellow

        $groupInfo = Invoke-RestMethod `
            -Method Post `
            -Uri 'https://api.vk.com/method/groups.getById' `
            -Body @{
                access_token = $vkToken
                v = '5.199'
                group_ids = 'expedicia_perm'
            }

        if ($groupInfo.error) {
            throw "VK groups API: $($groupInfo.error.error_msg) (code $($groupInfo.error.error_code))"
        }

        $groupList = if ($groupInfo.response.groups) { $groupInfo.response.groups } else { $groupInfo.response }
        $groupId = $groupList[0].id
        if (-not $groupId) { throw 'Cannot determine the VK community ID.' }

        $longPollInfo = Invoke-RestMethod `
            -Method Post `
            -Uri 'https://api.vk.com/method/groups.getLongPollServer' `
            -Body @{
                access_token = $vkToken
                v = '5.199'
                group_id = $groupId
            }

        if ($longPollInfo.error) {
            throw "VK Long Poll API: $($longPollInfo.error.error_msg) (code $($longPollInfo.error.error_code))"
        }

        Write-Host "`nNow send a NEW message in the booking chat. Waiting for up to 75 seconds..." -ForegroundColor Cyan
        $longPoll = $longPollInfo.response
        $foundPeer = $null

        for ($attempt = 1; $attempt -le 3 -and -not $foundPeer; $attempt++) {
            $updates = Invoke-RestMethod `
                -Method Get `
                -Uri $longPoll.server `
                -Body @{
                    act = 'a_check'
                    key = $longPoll.key
                    ts = $longPoll.ts
                    wait = 25
                }

            if ($updates.ts) { $longPoll.ts = $updates.ts }
            foreach ($update in $updates.updates) {
                if ($update.type -eq 'message_new') {
                    $candidate = $update.object.message.peer_id
                    if ($candidate -ge 2000000000) {
                        $foundPeer = $candidate
                        break
                    }
                }
            }
        }

        if ($foundPeer) {
            Write-Host "`nBooking chat VK_PEER_ID: $foundPeer" -ForegroundColor Green
            Write-Host 'Copy this number. Do not share the access token.' -ForegroundColor Cyan
            exit 0
        }

        Write-Host 'No chat event received. Check Long Poll event type message_new and invite the community bot again.' -ForegroundColor Yellow
        exit 1
    }

    Write-Host "`nAvailable chats:" -ForegroundColor Green
    $chats | Format-Table -AutoSize
    Write-Host 'Copy VK_PEER_ID for the booking chat. Do not share the access token.' -ForegroundColor Cyan
}
finally {
    if ($tokenPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($tokenPointer)
    }
    $vkToken = $null
    $secureToken = $null
}
