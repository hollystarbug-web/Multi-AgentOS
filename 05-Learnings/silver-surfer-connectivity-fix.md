# Silver Surfer — 2026-05-12

## Rule: WireGuard 0.0.0.0/0 AllowedIPs Blocks External Access

**What:** When WireGuard VPN has `AllowedIPs = 0.0.0.0/0` set, it intercepts ALL traffic and routes it through the VPN tunnel, making the VPS unreachable from external networks. **Why:** Dual default routes created — WireGuard tunnel and eth0 both competing. External traffic couldn't reach the VPS despite the server running correctly. **When:** Any time WireGuard is configured with full tunnel mode. **Fix:** `wg-quick down wg0` disables the tunnel immediately. For future WireGuard use, set specific subnets in AllowedIPs rather than 0.0.0.0/0.
