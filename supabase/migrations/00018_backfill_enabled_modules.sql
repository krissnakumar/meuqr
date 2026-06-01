-- ============================================
-- MeuQR Business OS — Backfill Enabled Modules
-- ============================================
-- For existing businesses created before the
-- auto-enable trigger was added.
-- ============================================

-- Backfill function: enables core modules + vertical-specific modules
-- for all existing businesses that don't have entries yet.
CREATE OR REPLACE FUNCTION backfill_enabled_modules()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  biz RECORD;
  v_slug TEXT;
  v_module_id UUID;
BEGIN
  FOR biz IN SELECT id, category, vertical_id FROM businesses LOOP
    -- Skip if business already has any enabled modules
    IF EXISTS (SELECT 1 FROM business_enabled_modules WHERE business_id = biz.id) THEN
      CONTINUE;
    END IF;

    -- Get default modules for this business's category/vertical
    -- Core modules are always added
    INSERT INTO business_enabled_modules (business_id, module_id, enabled, source)
    SELECT biz.id, m.id, true, 'default_vertical'
    FROM modules m
    WHERE m.is_core = true
    ON CONFLICT (business_id, module_id) DO NOTHING;

    -- Add vertical-specific modules (from vertical default_modules or category match)
    IF biz.vertical_id IS NOT NULL THEN
      FOR v_slug IN
        SELECT jsonb_array_elements_text(
          COALESCE(
            (SELECT default_modules FROM business_verticals WHERE id = biz.vertical_id),
            '[]'::jsonb
          )
        )
      LOOP
        SELECT id INTO v_module_id FROM modules WHERE slug = v_slug;
        IF v_module_id IS NOT NULL THEN
          INSERT INTO business_enabled_modules (business_id, module_id, enabled, source)
          VALUES (biz.id, v_module_id, true, 'default_vertical')
          ON CONFLICT (business_id, module_id) DO NOTHING;
        END IF;
      END LOOP;
    ELSE
      -- Fallback: guess modules based on category
      v_slug := biz.category;
      IF v_slug IN ('restaurant', 'food_beverage') THEN
        FOR v_slug IN SELECT jsonb_array_elements_text('["products","orders","menu","reviews","whatsapp_actions"]'::jsonb)
        LOOP
          SELECT id INTO v_module_id FROM modules WHERE slug = v_slug;
          IF v_module_id IS NOT NULL THEN
            INSERT INTO business_enabled_modules (business_id, module_id, enabled, source)
            VALUES (biz.id, v_module_id, true, 'default_vertical')
            ON CONFLICT (business_id, module_id) DO NOTHING;
          END IF;
        END LOOP;
      ELSIF v_slug IN ('health', 'clinic', 'dental', 'beauty', 'salon') THEN
        FOR v_slug IN SELECT jsonb_array_elements_text('["appointments","services","professionals","reviews","whatsapp_actions"]'::jsonb)
        LOOP
          SELECT id INTO v_module_id FROM modules WHERE slug = v_slug;
          IF v_module_id IS NOT NULL THEN
            INSERT INTO business_enabled_modules (business_id, module_id, enabled, source)
            VALUES (biz.id, v_module_id, true, 'default_vertical')
            ON CONFLICT (business_id, module_id) DO NOTHING;
          END IF;
        END LOOP;
      ELSIF v_slug IN ('retail', 'store', 'construction', 'auto', 'automotive') THEN
        FOR v_slug IN SELECT jsonb_array_elements_text('["products","quote_requests","reviews","whatsapp_actions"]'::jsonb)
        LOOP
          SELECT id INTO v_module_id FROM modules WHERE slug = v_slug;
          IF v_module_id IS NOT NULL THEN
            INSERT INTO business_enabled_modules (business_id, module_id, enabled, source)
            VALUES (biz.id, v_module_id, true, 'default_vertical')
            ON CONFLICT (business_id, module_id) DO NOTHING;
          END IF;
        END LOOP;
      ELSE
        -- Generic fallback
        FOR v_slug IN SELECT jsonb_array_elements_text('["products","reviews","whatsapp_actions"]'::jsonb)
        LOOP
          SELECT id INTO v_module_id FROM modules WHERE slug = v_slug;
          IF v_module_id IS NOT NULL THEN
            INSERT INTO business_enabled_modules (business_id, module_id, enabled, source)
            VALUES (biz.id, v_module_id, true, 'default_vertical')
            ON CONFLICT (business_id, module_id) DO NOTHING;
          END IF;
        END LOOP;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Execute the backfill
SELECT backfill_enabled_modules();

-- Drop the helper function after use (keep it clean)
DROP FUNCTION backfill_enabled_modules();
