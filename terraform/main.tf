# <-------------------- S3 Bucket -------------------->
resource "aws_s3_bucket" "tinasportfolio_bucket" {
  bucket = var.s3_bucket_name
}

resource "aws_s3_bucket_versioning" "tinasportfolio_bucket_versioning" {
  bucket = aws_s3_bucket.tinasportfolio_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_ownership_controls" "tinasportfolio_bucket_ownership" {
  bucket = aws_s3_bucket.tinasportfolio_bucket.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "tinasportfolio_bucket_access_block" {
  bucket = aws_s3_bucket.tinasportfolio_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_iam_policy_document" "tinasportfolio_bucket_policy" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.tinasportfolio_bucket.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.tinasportfolio_distribution.arn]
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tinasportfolio_bucket_encryption" {
  bucket = aws_s3_bucket.tinasportfolio_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3_primary.arn
    }
    bucket_key_enabled = true
  }

  depends_on = [aws_kms_key_policy.s3_primary]
}

resource "aws_s3_bucket" "tinasportfolio_logs_bucket" {
  #checkov:skip=CKV_AWS_144:Access logs bucket - replicating log data cross-region is not required
  #checkov:skip=CKV_AWS_18:This bucket is the access log destination - logging it would create a circular reference
  bucket = "${var.s3_bucket_name}-logs"
}

resource "aws_s3_bucket_ownership_controls" "tinasportfolio_logs_bucket_ownership" {
  #checkov:skip=CKV2_AWS_65:BucketOwnerPreferred required for CloudFront standard log delivery, which uses ACLs - BucketOwnerEnforced would silently break logging
  bucket = aws_s3_bucket.tinasportfolio_logs_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "tinasportfolio_logs_bucket_access_block" {
  bucket = aws_s3_bucket.tinasportfolio_logs_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tinasportfolio_logs_bucket_encryption" {
  bucket = aws_s3_bucket.tinasportfolio_logs_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_versioning" "tinasportfolio_logs_bucket_versioning" {
  bucket = aws_s3_bucket.tinasportfolio_logs_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "tinasportfolio_logs_bucket_lifecycle" {
  bucket = aws_s3_bucket.tinasportfolio_logs_bucket.id

  rule {
    id     = "expire-logs"
    status = "Enabled"

    filter {}

    expiration {
      days = 90
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

resource "aws_s3_bucket_logging" "tinasportfolio_bucket_logging" {
  bucket        = aws_s3_bucket.tinasportfolio_bucket.id
  target_bucket = aws_s3_bucket.tinasportfolio_logs_bucket.id
  target_prefix = "s3-access-logs/"
}

resource "aws_s3_bucket_lifecycle_configuration" "tinasportfolio_bucket_lifecycle" {
  bucket = aws_s3_bucket.tinasportfolio_bucket.id

  rule {
    id     = "portfolio-lifecycle"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

resource "aws_s3_bucket_notification" "tinasportfolio_bucket_notification" {
  bucket      = aws_s3_bucket.tinasportfolio_bucket.id
  eventbridge = true
}

resource "aws_s3_bucket_notification" "tinasportfolio_logs_bucket_notification" {
  bucket      = aws_s3_bucket.tinasportfolio_logs_bucket.id
  eventbridge = true
}

resource "aws_s3_bucket_policy" "tinasportfolio_bucket_policy" {
  bucket     = aws_s3_bucket.tinasportfolio_bucket.id
  policy     = data.aws_iam_policy_document.tinasportfolio_bucket_policy.json
  depends_on = [aws_s3_bucket_public_access_block.tinasportfolio_bucket_access_block]
}

# <-------------------- S3 Failover Bucket (us-west-2) -------------------->
resource "aws_s3_bucket" "tinasportfolio_failover_bucket" {
  #checkov:skip=CKV_AWS_144:This bucket is the replication destination - replicating it would be circular
  #checkov:skip=CKV_AWS_18:S3 server access logging does not support cross-region delivery; cannot log from us-west-2 to the us-east-1 logs bucket
  provider = aws.secondary
  bucket   = "${var.s3_bucket_name}-failover"
}

resource "aws_s3_bucket_ownership_controls" "tinasportfolio_failover_bucket_ownership" {
  provider = aws.secondary
  bucket   = aws_s3_bucket.tinasportfolio_failover_bucket.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "tinasportfolio_failover_bucket_access_block" {
  provider = aws.secondary
  bucket   = aws_s3_bucket.tinasportfolio_failover_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tinasportfolio_failover_bucket_encryption" {
  provider = aws.secondary
  bucket   = aws_s3_bucket.tinasportfolio_failover_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3_secondary.arn
    }
    bucket_key_enabled = true
  }

  depends_on = [aws_kms_key_policy.s3_secondary]
}

resource "aws_s3_bucket_versioning" "tinasportfolio_failover_bucket_versioning" {
  provider = aws.secondary
  bucket   = aws_s3_bucket.tinasportfolio_failover_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "tinasportfolio_failover_bucket_lifecycle" {
  provider = aws.secondary
  bucket   = aws_s3_bucket.tinasportfolio_failover_bucket.id

  rule {
    id     = "failover-lifecycle"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

data "aws_iam_policy_document" "tinasportfolio_failover_bucket_policy" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.tinasportfolio_failover_bucket.arn}/*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.tinasportfolio_distribution.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "tinasportfolio_failover_bucket_policy" {
  provider   = aws.secondary
  bucket     = aws_s3_bucket.tinasportfolio_failover_bucket.id
  policy     = data.aws_iam_policy_document.tinasportfolio_failover_bucket_policy.json
  depends_on = [aws_s3_bucket_public_access_block.tinasportfolio_failover_bucket_access_block]
}

resource "aws_s3_bucket_notification" "tinasportfolio_failover_bucket_notification" {
  provider    = aws.secondary
  bucket      = aws_s3_bucket.tinasportfolio_failover_bucket.id
  eventbridge = true
}

# <-------------------- S3 Replication -------------------->
data "aws_iam_policy_document" "s3_primary_kms_policy" {
  #checkov:skip=CKV_AWS_109:KMS key policies require Resource="*" — cannot reference own ARN in its own policy
  #checkov:skip=CKV_AWS_111:KMS key policies require Resource="*" — cannot reference own ARN in its own policy
  #checkov:skip=CKV_AWS_356:KMS key policies require Resource="*" — cannot reference own ARN in its own policy
  statement {
    sid    = "AllowRootAccount"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }
  statement {
    sid    = "AllowCloudFrontDecrypt"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["kms:Decrypt"]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.tinasportfolio_distribution.arn]
    }
  }
  statement {
    sid    = "AllowReplicationDecrypt"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = [aws_iam_role.replication_role.arn]
    }
    actions   = ["kms:Decrypt"]
    resources = ["*"]
  }
}

resource "aws_kms_key" "s3_primary" {
  provider                = aws.us_east_1
  description             = "KMS key for primary S3 bucket encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

resource "aws_kms_key_policy" "s3_primary" {
  provider                           = aws.us_east_1
  key_id                             = aws_kms_key.s3_primary.id
  policy                             = data.aws_iam_policy_document.s3_primary_kms_policy.json
  bypass_policy_lockout_safety_check = true
}

resource "aws_kms_alias" "s3_primary" {
  provider      = aws.us_east_1
  name          = "alias/${var.project_name}-s3-primary"
  target_key_id = aws_kms_key.s3_primary.key_id
}

data "aws_iam_policy_document" "s3_secondary_kms_policy" {
  #checkov:skip=CKV_AWS_109:KMS key policies require Resource="*" — cannot reference own ARN in its own policy
  #checkov:skip=CKV_AWS_111:KMS key policies require Resource="*" — cannot reference own ARN in its own policy
  #checkov:skip=CKV_AWS_356:KMS key policies require Resource="*" — cannot reference own ARN in its own policy
  statement {
    sid    = "AllowRootAccount"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }
  statement {
    sid    = "AllowCloudFrontDecrypt"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions   = ["kms:Decrypt"]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.tinasportfolio_distribution.arn]
    }
  }
  statement {
    sid    = "AllowReplicationGenerateDataKey"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = [aws_iam_role.replication_role.arn]
    }
    actions   = ["kms:GenerateDataKey"]
    resources = ["*"]
  }
}

resource "aws_kms_key" "s3_secondary" {
  provider                = aws.secondary
  description             = "KMS key for failover S3 bucket encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

resource "aws_kms_key_policy" "s3_secondary" {
  provider                           = aws.secondary
  key_id                             = aws_kms_key.s3_secondary.id
  policy                             = data.aws_iam_policy_document.s3_secondary_kms_policy.json
  bypass_policy_lockout_safety_check = true
}

resource "aws_kms_alias" "s3_secondary" {
  provider      = aws.secondary
  name          = "alias/${var.project_name}-s3-secondary"
  target_key_id = aws_kms_key.s3_secondary.key_id
}

resource "aws_iam_role" "replication_role" {
  name = "${var.project_name}-s3-replication"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "s3.amazonaws.com" }
    }]
  })
}

data "aws_iam_policy_document" "replication_policy" {
  statement {
    actions   = ["s3:GetReplicationConfiguration", "s3:ListBucket"]
    resources = [aws_s3_bucket.tinasportfolio_bucket.arn]
  }

  statement {
    actions = [
      "s3:GetObjectVersionForReplication",
      "s3:GetObjectVersionAcl",
      "s3:GetObjectVersionTagging",
    ]
    resources = ["${aws_s3_bucket.tinasportfolio_bucket.arn}/*"]
  }

  statement {
    actions = [
      "s3:ReplicateObject",
      "s3:ReplicateDelete",
      "s3:ReplicateTags",
    ]
    resources = ["${aws_s3_bucket.tinasportfolio_failover_bucket.arn}/*"]
  }

  statement {
    actions   = ["kms:Decrypt"]
    resources = [aws_kms_key.s3_primary.arn]
  }

  statement {
    actions   = ["kms:GenerateDataKey"]
    resources = [aws_kms_key.s3_secondary.arn]
  }
}

resource "aws_iam_role_policy" "replication_policy" {
  name   = "${var.project_name}-s3-replication"
  role   = aws_iam_role.replication_role.id
  policy = data.aws_iam_policy_document.replication_policy.json
}

resource "aws_s3_bucket_replication_configuration" "tinasportfolio_bucket_replication" {
  bucket     = aws_s3_bucket.tinasportfolio_bucket.id
  role       = aws_iam_role.replication_role.arn
  depends_on = [
    aws_s3_bucket_versioning.tinasportfolio_bucket_versioning,
    aws_s3_bucket_versioning.tinasportfolio_failover_bucket_versioning,
  ]

  rule {
    id     = "replicate-all"
    status = "Enabled"

    filter {}

    delete_marker_replication {
      status = "Enabled"
    }

    source_selection_criteria {
      sse_kms_encrypted_objects {
        status = "Enabled"
      }
    }

    destination {
      bucket        = aws_s3_bucket.tinasportfolio_failover_bucket.arn
      storage_class = "STANDARD"

      encryption_configuration {
        replica_kms_key_id = aws_kms_key.s3_secondary.arn
      }
    }
  }
}

# <-------------------- WAF (must be us-east-1) -------------------->
resource "aws_wafv2_web_acl" "tinasportfolio_waf" {
  provider    = aws.us_east_1
  name        = "${var.project_name}-waf"
  description = "WAF rules for portfolio CloudFront distribution"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  rule {
    name     = "CommonRuleSet"
    priority = 1
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSet"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "KnownBadInputs"
    priority = 2
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "KnownBadInputs"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "IPReputationList"
    priority = 3
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAmazonIpReputationList"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "IPReputationList"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AnonymousIpList"
    priority = 4
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAnonymousIpList"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AnonymousIpList"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}WAF"
    sampled_requests_enabled   = true
  }
}

data "aws_caller_identity" "current" {
  provider = aws.us_east_1
}

data "aws_iam_policy_document" "waf_logs_kms_policy" {
  #checkov:skip=CKV_AWS_109:KMS key policies require Resource="*" by AWS design - it refers to this key only, not all KMS keys
  #checkov:skip=CKV_AWS_111:KMS key policies require Resource="*" by AWS design - it refers to this key only, not all KMS keys
  #checkov:skip=CKV_AWS_356:KMS key policies require Resource="*" by AWS design - it refers to this key only, not all KMS keys

  statement {
    sid    = "EnableIAMUserPermissions"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }

  statement {
    sid    = "AllowCloudWatchLogs"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["logs.us-east-1.amazonaws.com"]
    }
    actions = [
      "kms:Encrypt*",
      "kms:Decrypt*",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:Describe*",
    ]
    resources = ["*"]
  }
}

resource "aws_kms_key" "waf_logs" {
  provider                = aws.us_east_1
  description             = "KMS key for WAF CloudWatch Logs encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

resource "aws_kms_key_policy" "waf_logs" {
  provider                        = aws.us_east_1
  key_id                          = aws_kms_key.waf_logs.id
  policy                          = data.aws_iam_policy_document.waf_logs_kms_policy.json
  bypass_policy_lockout_safety_check = true
}

resource "aws_kms_alias" "waf_logs" {
  provider      = aws.us_east_1
  name          = "alias/${var.project_name}-waf-logs"
  target_key_id = aws_kms_key.waf_logs.key_id
}

resource "aws_cloudwatch_log_group" "waf_logs" {
  provider          = aws.us_east_1
  name              = "aws-waf-logs-${var.project_name}"
  retention_in_days = 365
  kms_key_id        = aws_kms_key.waf_logs.arn

  depends_on = [aws_kms_key_policy.waf_logs]
}

resource "aws_cloudwatch_log_resource_policy" "waf_logs_policy" {
  provider    = aws.us_east_1
  policy_name = "aws-waf-logs-${var.project_name}"

  policy_document = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "delivery.logs.amazonaws.com" }
      Action    = ["logs:CreateLogStream", "logs:PutLogEvents"]
      Resource  = "${aws_cloudwatch_log_group.waf_logs.arn}:*"
    }]
  })
}

resource "aws_wafv2_web_acl_logging_configuration" "tinasportfolio_waf_logging" {
  provider                = aws.us_east_1
  log_destination_configs = [aws_cloudwatch_log_group.waf_logs.arn]
  resource_arn            = aws_wafv2_web_acl.tinasportfolio_waf.arn
}

# <----- ACM Certificate (must be us-east-1 for CloudFront) ----->
resource "aws_acm_certificate" "tinasportfolio_cert" {
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# <-------------------- CloudFront Function -------------------->
resource "aws_cloudfront_function" "url_rewrite" {
  name    = "${var.project_name}-url-rewrite"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = <<-EOT
    function handler(event) {
      var request = event.request;
      var uri = request.uri;
      if (uri.endsWith('/')) {
        request.uri += 'index.html';
      } else if (!uri.includes('.')) {
        request.uri += '/index.html';
      }
      return request;
    }
  EOT
}

resource "aws_cloudfront_origin_access_control" "tinasportfolio_oac" {
  name                              = "${var.project_name}-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_response_headers_policy" "security_headers" {
  name = "${var.project_name}-security-headers"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
    content_type_options {
      override = true
    }
    frame_options {
      frame_option = "DENY"
      override     = true
    }
    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
    content_security_policy {
      content_security_policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:;"
      override                = true
    }
  }
}

# <-------------------- CloudFront -------------------->
resource "aws_cloudfront_distribution" "tinasportfolio_distribution" {
  origin {
    domain_name              = aws_s3_bucket.tinasportfolio_bucket.bucket_regional_domain_name
    origin_id                = "S3-${var.project_name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.tinasportfolio_oac.id
  }

  origin {
    domain_name              = aws_s3_bucket.tinasportfolio_failover_bucket.bucket_regional_domain_name
    origin_id                = "S3-${var.project_name}-failover"
    origin_access_control_id = aws_cloudfront_origin_access_control.tinasportfolio_oac.id
  }

  origin_group {
    origin_id = "${var.project_name}-origin-group"

    failover_criteria {
      status_codes = [500, 502, 503, 504]
    }

    member {
      origin_id = "S3-${var.project_name}"
    }

    member {
      origin_id = "S3-${var.project_name}-failover"
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name, "www.${var.domain_name}"]

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    target_origin_id           = "${var.project_name}-origin-group"
    viewer_protocol_policy     = "redirect-to-https"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security_headers.id
    min_ttl                    = 0
    default_ttl                = 3600
    max_ttl                    = 86400

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.url_rewrite.arn
    }
  }

  logging_config {
    bucket          = aws_s3_bucket.tinasportfolio_logs_bucket.bucket_regional_domain_name
    prefix          = "cloudfront-logs/"
    include_cookies = false
  }

  restrictions {
    geo_restriction {
      restriction_type = var.geo_restriction_type
      locations        = var.geo_restriction_locations
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.tinasportfolio_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  web_acl_id = aws_wafv2_web_acl.tinasportfolio_waf.arn
}
