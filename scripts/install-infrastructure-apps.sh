#!/usr/bin/env bash
set -euo pipefail

APP="${1:-}"

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "Run as root: sudo $0 <zabbix|agent-dvr|rc2|freepbx|gitlab|nethserver8|proxmox8|all>" >&2
  exit 1
fi

install_zabbix() {
  apt-get update
  apt-get install -y zabbix-agent
  systemctl enable zabbix-agent >/dev/null 2>&1 || true
  systemctl restart zabbix-agent >/dev/null 2>&1 || true
  echo "Zabbix Agent installed and started."
}

print_managed_external() {
  local name="$1"
  local note="$2"
  cat <<EOF
$name is registered as an Olympus infrastructure app.
$note
Use the official upstream installer or a dedicated VM/container where appropriate, then point Olympus to its local URL.
EOF
}

case "$APP" in
  zabbix)
    install_zabbix
    ;;
  agent-dvr)
    print_managed_external "Agent DVR" "Agent DVR normally installs from the official iSpy/Agent DVR distribution and should run as a local service, commonly on port 8090."
    ;;
  rc2)
    print_managed_external "RadioConsole2" "RC2 is staged as a radio-console integration surface. Install the supported RC2 runtime for your target radio environment before binding it to Olympus."
    ;;
  freepbx)
    print_managed_external "FreePBX" "FreePBX is best deployed as its own PBX system or VM because it manages Asterisk, web services, database services, and telephony state."
    ;;
  gitlab)
    print_managed_external "GitLab CE" "GitLab Community Edition is best deployed as its own code-hosting service or VM because it manages repositories, web services, SSH, background jobs, and database state."
    ;;
  nethserver8)
    print_managed_external "NethServer 8" "NethServer 8 is best deployed as its own managed host or cluster node. Olympus registers it as an admin app and service surface."
    ;;
  proxmox8)
    print_managed_external "Proxmox 8" "Proxmox 8 should be installed on a dedicated virtualization host. Olympus registers it as an infrastructure console app."
    ;;
  all)
    install_zabbix
    print_managed_external "Agent DVR" "Install Agent DVR from the official distribution and bind the local console URL in Olympus."
    print_managed_external "RadioConsole2" "Install the supported RC2 runtime and bind it to Olympus."
    print_managed_external "FreePBX" "Deploy FreePBX as a PBX VM or appliance and bind it to Olympus."
    print_managed_external "GitLab CE" "Deploy GitLab CE as a code-hosting service or VM and bind it to Olympus."
    print_managed_external "NethServer 8" "Deploy NethServer 8 as a host or cluster node and bind it to Olympus."
    print_managed_external "Proxmox 8" "Deploy Proxmox 8 as a dedicated virtualization host and bind it to Olympus."
    ;;
  *)
    echo "Usage: sudo $0 <zabbix|agent-dvr|rc2|freepbx|gitlab|nethserver8|proxmox8|all>" >&2
    exit 2
    ;;
esac
