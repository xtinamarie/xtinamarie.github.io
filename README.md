# My Portfolio

This repository contains the source code of my terminal-style personal portfolio site hosted on AWS (S3 + CloudFront) with WAF protection, a custom domain, and automated deployments via GitHub Actions. The IaC is managed with Terraform.

My website is live at: `https://kristinamarie.me`

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Hosting | AWS S3 (static) + CloudFront (CDN) |
| SSL | AWS Certificate Manager (ACM) |
| Security | AWS WAF, CloudFront security headers |
| Infrastructure | Terraform |
| CI/CD | GitHub Actions |

## Project Structure

```
.
├── index.html                  # Main portfolio page
├── favicon.ico                 # Site favicon
├── secretblog/
│   └── index.html              # Secret blog page (in progress)
├── static/
│   ├── css/index.css           # Styles
│   ├── img/                    # Static assets
│   │   ├── and-i-oop.gif
│   │   ├── maddy-side-eye.gif
│   │   ├── pepe-giggle.gif
│   │   └── stardew-bg.jpg
│   └── js/
│       ├── index.js            # Terminal emulator logic
│       └── matrix.js           # Canvas binary rain background
├── terraform/
│   ├── providers.tf            # AWS provider config (dual-region for WAF + ACM)
│   ├── variables.tf            # Input variables (project name, region, bucket, domain)
│   └── main.tf                 # S3, CloudFront, WAF, ACM, KMS, replication, CloudFront Function
└── .github/
    └── workflows/
        ├── deploy.yml          # Deploys to S3 on push to master
        └── security.yml        # Gitleaks + tfsec on every push and PR
```

> `terraform/outputs.tf` is intentionally excluded from this repository — it prints resource IDs that are stored as GitHub Secrets and would otherwise be visible in public CI/CD logs.

<br><br><br><br>
# Self-Hosting / Replication Guide

The sections below are intended for developers who want to replicate this infrastructure in their own repository using Terraform and AWS.

This guide walks through:
- provisioning the AWS infrastructure
- configuring a custom domain
- setting up CI/CD with GitHub Actions
- deploying a static site securely through CloudFront + WAF

## Running Locally

No dependencies or setup required. From the project root:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Deploying to AWS

### Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.0
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) configured with an IAM user that has the following policies attached:
  - `AmazonS3FullAccess`
  - `CloudFrontFullAccess`
  - `AWSWAFFullAccess`
  - `AWSCertificateManagerFullAccess`
  - `IAMFullAccess` (required to create the S3 replication role and policy)
  - `CloudWatchLogsFullAccess` (required to create the WAF log group and resource policy)
  - `AWSKeyManagementServicePowerUser` (required to create and manage customer-managed KMS keys)
  - An inline policy with the following additional KMS actions not covered by the managed policy above:
    ```json
    {
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Action": [
          "kms:EnableKeyRotation", "kms:DisableKeyRotation", "kms:GetKeyRotationStatus",
          "kms:ScheduleKeyDeletion", "kms:CancelKeyDeletion", "kms:PutKeyPolicy",
          "kms:GetKeyPolicy", "kms:CreateAlias", "kms:DeleteAlias", "kms:ListAliases",
          "kms:TagResource", "kms:UntagResource", "kms:ListResourceTags",
          "kms:GenerateDataKey", "kms:Decrypt"
        ],
        "Resource": "*"
      }]
    }
    ```

### First-time infrastructure setup

```bash
cd terraform
terraform init
terraform apply -var="s3_bucket_name=your-globally-unique-bucket-name"
```

After `terraform apply` completes, copy all four output values:
- `cloudfront_domain_name` — temporary URL to verify the site is live
- `cloudfront_distribution_id` — needed for GitHub Actions
- `acm_validation_records` — two CNAME records needed to validate your SSL certificate

### Custom domain setup (kristinamarie.me)

**1. Validate the SSL certificate via Squarespace DNS**

In Squarespace → Domains → `your domain` → DNS Settings, add the two CNAME records printed in `acm_validation_records` exactly as shown. Wait until the certificate status in AWS Certificate Manager shows **Issued** (usually a few minutes).

**2. Point the domain at CloudFront via Squarespace DNS**

Add these two records in Squarespace DNS:

| Type | Host | Value |
|---|---|---|
| `ALIAS` | `@` | value of `cloudfront_domain_name` |
| `CNAME` | `www` | value of `cloudfront_domain_name` |

**3. Run `terraform apply` once more**

After the certificate is issued, run apply again to finalize the CloudFront distribution with the cert attached.

### Initial file upload to S3

This is a one-time manual step. After this, GitHub Actions handles all deploys.

```bash
aws s3 sync . s3://your-bucket-name --delete --exclude "terraform/*" --exclude ".github/*" --exclude ".git/*" --exclude ".gitignore" --exclude "*.md"
```

> On Windows PowerShell, run this as a single line — the `\` line continuation character is not supported.

### GitHub Secrets required for CI/CD

Add these in **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `S3_BUCKET_NAME` | The bucket name you passed to Terraform |
| `CLOUDFRONT_DISTRIBUTION_ID` | Output from `terraform apply` |

Once secrets are set, every push to `master` automatically syncs files to S3 and invalidates the CloudFront cache.

## CI/CD Pipelines

**`deploy.yml`** — triggers on push to `master`
- Syncs all site files (`index.html`, `static/`, `secretblog/`) to S3
- Invalidates CloudFront cache so changes are live immediately

**`security.yml`** — triggers on push to `master` and on all pull requests
- [Gitleaks](https://github.com/gitleaks/gitleaks) — scans for accidentally committed secrets
- [tfsec](https://github.com/aquasecurity/tfsec) — scans Terraform for security misconfigurations

## Security Scanning

The Terraform infrastructure in this project was validated locally using [Checkov](https://www.checkov.io/) to ensure resources are correctly configured and free of common security misconfigurations. All flagged checks were either remediated or explicitly suppressed with documented reasons where architectural constraints made full compliance impractical.

My custom Checkov policies are in development at [xtinamarie/my-checkov-policies](https://github.com/xtinamarie/my-checkov-policies) and will eventually be run alongside the built-in policy set.

## Infrastructure Overview

- **S3** — private primary bucket (us-east-1) with versioning, KMS customer-managed encryption, lifecycle policies (noncurrent versions expire after 30 days), EventBridge notifications, and all public access blocked. Only accessible via CloudFront using Origin Access Control (OAC).
- **S3 Replication** — cross-region replication to a failover bucket in us-west-2, encrypted with its own KMS customer-managed key. Replication includes delete markers.
- **S3 Access Logs** — a dedicated logging bucket captures S3 and CloudFront access logs with a 90-day expiration lifecycle.
- **KMS** — three customer-managed keys: one for the primary S3 bucket (us-east-1), one for the failover S3 bucket (us-west-2), and one for WAF CloudWatch Logs. All keys have automatic annual rotation enabled. CloudFront is granted `kms:Decrypt` on both S3 keys so it can serve encrypted objects via OAC.
- **CloudFront** — HTTPS enforced (HTTP redirects to HTTPS), serves `index.html` as the default root object, aliases set to `kristinamarie.me` and `www.kristinamarie.me`. Uses an origin group for automatic failover to the us-west-2 bucket on 5xx errors.
- **CloudFront Function** — rewrites subdirectory requests (e.g. `/secretblog/`) to their `index.html` at the edge, since S3 + OAC does not resolve directory paths automatically.
- **ACM** — SSL certificate issued for `kristinamarie.me` and `www.kristinamarie.me`, validated via DNS. Free when used with CloudFront.
- **WAF** — four AWS managed rule groups attached to the CloudFront distribution: Common Rule Set (OWASP Top 10), Known Bad Inputs, Amazon IP Reputation List, and Anonymous IP List (blocks Tor exit nodes and anonymous proxies). WAF logs are sent to a KMS-encrypted CloudWatch Logs log group with a 365-day retention policy.
- **Security Headers** — applied at the CloudFront layer via a response headers policy: HSTS, CSP, X-Frame-Options (DENY), X-Content-Type-Options, and Referrer-Policy.

## Contributing

Clone the repository and create a branch off `master`. Use the `feature/` prefix for branch names:

```
feature/update-about-section
feature/add-writeup
```

Open a pull request [here](https://github.com/xtinamarie/xtinamarie.github.io/pulls) and assign `xtinamarie` as reviewer.
