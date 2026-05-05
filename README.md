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
- Syncs all site files to S3
- Invalidates CloudFront cache so changes are live immediately

**`security.yml`** — triggers on push to `master` and on all pull requests
- [Gitleaks](https://github.com/gitleaks/gitleaks) — scans for accidentally committed secrets
- [tfsec](https://github.com/aquasecurity/tfsec) — scans Terraform for security misconfigurations

## Security Scanning

The Terraform infrastructure in this project was validated locally using [Checkov](https://www.checkov.io/) to ensure resources are correctly configured and free of common security misconfigurations. All flagged checks were either remediated or explicitly suppressed with documented reasons where architectural constraints made full compliance impractical.

My custom Checkov policies are in development at [xtinamarie/my-checkov-policies](https://github.com/xtinamarie/my-checkov-policies) and will eventually be run alongside the built-in policy set.

## Infrastructure Overview

Here's a breakdown of what's actually being provisioned and why I made the choices I did.

- **S3 (primary bucket, us-east-1)** — this is where the actual site files live. I've blocked all public access to it, so it can *only* be reached through CloudFront — not directly by a browser. The bucket also has versioning turned on, which is a requirement for cross-region replication (more on that below) and a nice safety net in general. Files at rest are encrypted with a customer-managed KMS key.

- **S3 replication (failover bucket, us-west-2)** — I set up a second bucket in a completely different region that automatically mirrors everything in the primary bucket. If AWS's us-east-1 region has an outage, CloudFront will quietly start serving from us-west-2 instead. The failover bucket has its own separate KMS key because encryption keys are regional — you can't share one across regions.

- **S3 access logs bucket** — a third bucket just for logs. Both the primary S3 bucket and CloudFront write their access logs here. Logs auto-delete after 90 days so they don't accumulate indefinitely.

- **KMS keys** — I'm using three customer-managed keys total: one for the primary S3 bucket, one for the failover bucket, and one for WAF logs. All three have automatic annual rotation enabled. You might notice the key policies use `Resource = "*"` — that looks overly broad, but it's actually an AWS constraint: a KMS key policy literally cannot reference its own ARN, so `*` is required and it only applies to that specific key.

- **CloudFront** — this is the public-facing layer that actually serves my site to my visitors. It enforces HTTPS (plain HTTP gets redirected), handles both `kristinamarie.me` and `www.kristinamarie.me`, and uses an *origin group* so that if the primary S3 bucket returns a 5xx error, CloudFront automatically tries the failover bucket without visitors noticing anything.

- **CloudFront Function (URL rewrite)** — a small piece of edge code that rewrites directory-style URLs to their `index.html` file. This is necessary because S3 doesn't behave like a traditional web server — if someone visits `/about`, S3 doesn't know to look for `/about/index.html` on its own. This function handles that translation before the request ever reaches S3.

- **ACM (SSL certificate)** — the free TLS certificate from AWS that makes `https://` work. It covers both the root domain and `www`. The certificate *must* be provisioned in us-east-1 regardless of where your other resources are — that's just an AWS requirement for anything attached to CloudFront.

- **WAF** — a Web Application Firewall sits in front of CloudFront and filters incoming requests using four AWS-managed rule groups: common exploits (think OWASP Top 10), known bad inputs, IP reputation lists, and anonymous IP blocking (Tor exit nodes, VPN proxies, etc.). The WAF also *must* live in us-east-1 for the same reason as ACM. All WAF logs go to a KMS-encrypted CloudWatch log group.

- **Security response headers** — injected by CloudFront on every response via a headers policy. These include HSTS (forces HTTPS even if someone types `http://`), CSP (controls what external resources the page can load), `X-Frame-Options: DENY` (prevents clickjacking), and a few others. Doing this at the CloudFront layer means it applies to every file served, without touching the HTML itself.

## Contributing

Clone the repository and create a branch off `master`. Use the `feature/` prefix for branch names:

```
feature/update-about-section
feature/add-writeup
```

Open a pull request [here](https://github.com/xtinamarie/xtinamarie.github.io/pulls) and assign `xtinamarie` (me) as reviewer.
