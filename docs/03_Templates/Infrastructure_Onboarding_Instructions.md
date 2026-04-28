# Template - Client Infrastructure & Remote Access Onboarding

> [!TIP]
> **Intenção do Sistema:** Este documento lista as instruções de engenharia prontas para envio. Assim que a ata do *Kickoff* confirmar o Perfil de Infraestrutura do cliente, a IA ou o Operador deve copiar a respectiva seção abaixo e enviar ao cliente para garantir o provisionamento remoto do OpenClaw.

---

## ☁️ Perfil A: Cloud Native (O Padrão Ouro AWS/DigitalOcean/GCP)
*Envie este roteiro se o cliente hospeda os agentes em um servidor Web nativo.*

**Assunto:** Access Requirements for OpenClaw Deployment

Hi [Nome do Cliente],

To start provisioning the OpenClaw Engine and modules as per our Kickoff, our engineering team requires zero-trust remote access to your staging/production server.

Please complete the following technical setup:
1.  **VPC / Server Box:** Provision a dedicated Linux environment (Ubuntu 22.04+ or Debian) with Docker and Docker-Compose installed.
2.  **SSH Key Exchange:** Generate a new `.pem` or `.pub` key pair explicitly for Antigravity Consulting. Please do not re-use root passwords.
3.  **Firewall:** Ensure ports `22` (SSH) and your target API ports (e.g., `3000` or `8080`) are whitelisted for inbound traffic.

Please securely share the SSH key and the server IP address via Upwork messages or a secure 1-time-link. We will initiate our deployment scripts immediately upon connection.

Best regards,
Antigravity Engineering

---

## 🏢 Perfil B: Corporate Firewall (VPN / Intranet Restrita)
*Envie este roteiro se o cliente for "Enterprise" e o acesso SSH do Brasil à rede deles estiver bloqueado.*

**Assunto:** Corporate Remote Access Protocol – Next Steps

Hi [Nome do Cliente],

Following our Kickoff, we are ready to commence the architecture build. As discussed, your infrastructure is masked behind an internal corporate firewall.

To maintain your strict security compliance while allowing our team to deploy the OpenClaw Engine, please provide the following:
1.  **VPN Credentials:** A valid corporate VPN profile (OpenVPN, Cisco AnyConnect, Tailscale, or equivalent) and any required 2FA temporary tokens for access from our IP block (Brazil/South America).
2.  **Internal Target Node:** The internal Local IP where the target Linux deployment server resides.
3.  **Server Credentials:** Temporary internal SSH credentials once we are inside the V-LAN.

Please work with your IT/DevOps department to provision this containerized access so we can jump into the sprint on Monday.

Best regards,
Antigravity Engineering

---

## 🔌 Perfil C: Local Desktop (O "Servidor de Debaixo da Mesa")
*Envie este roteiro se o cliente rodar os Agentes Pessoais no próprio computador / Windows Local.*

**Assunto:** Local Desktop Integration Setup (Remote Desktop)

Hi [Nome do Cliente],

Since your Personal AI Agents are currently running locally on your office workstation, we will need to perform a supervised "Remote Desktop Session" to install the Docker dependencies and configure the OpenClaw Hub on your machine.

Here are the requirements for our deployment session:
1.  **Software Installation:** Please download and install [Tailscale](https://tailscale.com/) or [AnyDesk](https://anydesk.com/en).
2.  **Prerequisites:** Ensure your PC has [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running prior to the session.
3.  **Scheduling:** Please book a 45-minute technical sync window via this calendar link [Inserir Link] so our engineer can remote in and set up the network hooks while you supervise.

Looking forward to our session!

Best regards,
Antigravity Engineering
