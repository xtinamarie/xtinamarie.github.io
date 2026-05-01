variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "tinasportfolio"
}

variable "aws_region" {
  description = "AWS region for primary resources"
  type        = string
  default     = "us-east-1"
}

variable "s3_bucket_name" {
  description = "S3 bucket name — must be globally unique, lowercase letters, numbers, and hyphens only (no underscores)"
  type        = string

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$", var.s3_bucket_name))
    error_message = "S3 bucket name must be 3-63 characters, lowercase alphanumeric and hyphens only, and cannot start or end with a hyphen."
  }
}

variable "domain_name" {
  description = "Your custom domain (e.g. kristinamarie.me)"
  type        = string
  default     = "kristinamarie.me"
}

variable "secondary_region" {
  description = "AWS region for failover/replica resources"
  type        = string
  default     = "us-west-2"
}

variable "geo_restriction_type" {
  description = "CloudFront geo restriction type: whitelist or blacklist"
  type        = string
  default     = "whitelist"
}

variable "geo_restriction_locations" {
  description = "ISO 3166-1-alpha-2 country codes to whitelist (or blacklist)"
  type        = list(string)
  default     = ["US", "CA", "GB", "AU", "DE", "FR", "NL"]
}
