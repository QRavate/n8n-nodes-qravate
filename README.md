# n8n-nodes-qravate

[![CI](https://github.com/QRavate/n8n-nodes-qravate/actions/workflows/ci.yml/badge.svg)](https://github.com/QRavate/n8n-nodes-qravate/actions/workflows/ci.yml)
[![Contract test](https://github.com/QRavate/n8n-nodes-qravate/actions/workflows/contract.yml/badge.svg)](https://github.com/QRavate/n8n-nodes-qravate/actions/workflows/contract.yml)
[![npm](https://img.shields.io/npm/v/n8n-nodes-qravate)](https://www.npmjs.com/package/n8n-nodes-qravate)

n8n community nodes for [QRavate](https://www.qravate.com), dynamic QR codes with style: create QR codes, change where they point without reprinting them, pause them, read their scan stats, and start workflows on QRavate events.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Compatibility](#compatibility) · [Usage](#usage) · [Resources](#resources)

## Installation

In n8n, go to **Settings → Community Nodes → Install** and enter `n8n-nodes-qravate`. See the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Operations

**QRavate** node, resource **QR Code**:

| Operation | What it does |
|---|---|
| Create | Create a dynamic QR code with a name and a destination URL |
| Get | Get a QR code by ID |
| Get Many | List QR codes, newest first, with search and state filters |
| Update | Change the destination or the name. The printed QR code stays the same. |
| Pause / Resume | Pause a QR code (scanners see a neutral page) or send scans to the destination again |
| Get Stats | Scans over a period: total, unique visitors, per day, countries, devices |
| Delete | Delete a QR code. It can be restored for 30 days from your QRavate account. |

The node can also be used as a tool by n8n AI agents.

**QRavate Trigger** node, starts a workflow when:

- a QR code is created (`qr.created`);
- the destination of a QR code changes (`qr.destination_changed`);
- a QR code is paused or resumed (`qr.state_changed`);
- a QR code reaches a number of scans (`scans.threshold`).

The trigger registers its webhook in your QRavate workspace when the workflow is activated and removes it when the workflow is deactivated. Every call is checked against the webhook's signature (`X-Webhook-Signature`).

## Credentials

1. You need a QRavate account on the **Pro** or **Max** plan (the API is included from Pro).
2. In your QRavate account, open **API et webhooks** and create a key. It starts with `sk_` and is shown only once.
3. In n8n, create a **QRavate API** credential and paste the key. Leave the API URL as it is.

The key gives access to one workspace. Revoke it from QRavate at any time.

## Compatibility

Requires n8n 2.46.1 or later.

## Usage

- QR code IDs come from **Create**, **Get Many** or the trigger output (`data.id`).
- Dates for **Get Stats** use the `YYYY-MM-DD` format, in Paris time. Without dates, you get the last 30 days.
- The API allows 120 requests per minute per key.

## Resources

- [QRavate API documentation](https://www.qravate.com/docs)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- Questions or bugs: [open an issue](https://github.com/QRavate/n8n-nodes-qravate/issues) or write to support@qravate.com.

## Version history

See [CHANGELOG.md](CHANGELOG.md).
