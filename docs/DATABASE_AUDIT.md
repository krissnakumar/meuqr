# MeuQR — Database Audit

> Comparing Supabase migration definitions with code usage

---

## Tables Audit

### `profiles`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | `id`, `email`, `full_name`, `phone`, `avatar_url`, `created_at`, `updated_at` |
| Code usage | ✅ | Referenced in `useAuth`, `auth.ts`, member queries |
| RLS | ✅ | Policies present |
| Issues | ✅ | None |

### `businesses`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | All columns present including `subscription_tier`, `category`, `slug`, `whatsapp` |
| Code usage | ✅ | Used extensively across dashboard |
| RLS | ✅ | Owner/staff policies |
| Issues | ⚠️ | Missing index on `slug` for public page lookups |

### `business_members`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | `id`, `business_id`, `user_id`, `role`, `created_at` |
| Code usage | ✅ | Used in members page |
| RLS | ✅ | Present |
| Issues | ✅ | None |

### `templates`, `template_sections`, `template_items`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | All three tables present |
| Code usage | ✅ | Used in setup page template cloning |
| Issues | ✅ | None — seed data present in `00002_seed_data.sql` |

### `pages`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | All columns including `seo_title`, `seo_description`, `seo_image_url`, `custom_css`, `custom_js` |
| Code usage | ✅ | Page builder, settings, public page |
| RLS | ✅ | Present |
| Issues | ✅ | None |

### `sections`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | All columns |
| Code usage | ✅ | Page editor |
| Issues | ✅ | None |

### `items`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | All columns including `price`, `description` |
| Code usage | ✅ | Page editor, orders |
| Issues | ✅ | None |

### `qr_codes`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | All columns including `short_code`, `style_config`, `page_id`, `business_id` |
| Code usage | ✅ | QR management, public page |
| RLS | ✅ | Present |
| Issues | ⚠️ | Missing unique constraint on `short_code` (should have one) |

### `scans`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | All columns |
| Code usage | ✅ | Analytics, API routes |
| RLS | ✅ | Present |
| Issues | ✅ | None |

### `clicks`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | All columns |
| Code usage | ✅ | Analytics, API routes |
| RLS | ✅ | Present |
| Issues | ✅ | None |

### `leads`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | All columns |
| Code usage | ✅ | Leads page |
| RLS | ✅ | Present |
| Issues | ✅ | None |

### `quote_requests`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | All columns including `items` (JSONB), `message` |
| Code usage | ✅ | Quote requests page |
| RLS | ✅ | Present |
| Issues | ✅ | None |

### `orders`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | All columns including `items` (JSONB), `total`, `status`, `payment_method` |
| Code usage | ✅ | Orders page |
| RLS | ✅ | Present |
| Issues | ✅ | None |

### `subscriptions`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | All columns |
| Code usage | ✅ | Billing page |
| RLS | ✅ | Present |
| Issues | ✅ | None |

### `payments`
| Aspect | Status | Details |
|--------|--------|---------|
| Migration | ✅ | All columns |
| Code usage | ✅ | Edge function |
| RLS | ✅ | Present |
| Issues | ✅ | None |

## Storage Buckets

| Bucket | Status | Notes |
|--------|--------|-------|
| `business-logos` | ⚠️ | Referenced in docs but not created in migration |
| `product-images` | ⚠️ | Referenced in docs but not created in migration |
| `qr-logos` | ⚠️ | Referenced in docs but not created in migration |

## Summary

- **Tables verified:** 17/17 match migration definitions
- **Mismatches found:** 0 critical mismatches
- **Missing indexes:** 1 (`businesses.slug`)
- **Missing unique constraints:** 1 (`qr_codes.short_code`)
- **Storage buckets:** 3 not created programmatically
