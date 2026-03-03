-- ============================================
-- MIGRATION: Ferretería catalog
-- Replaces generic products with hardware store data.
-- Run in Supabase SQL Editor.
-- ============================================

-- 1. Clear existing data (order matters due to FK constraints)
delete from public.order_items;
delete from public.orders;
delete from public.cart_items;
delete from public.products;
delete from public.categories;

-- 2. Insert new categories
insert into public.categories (id, name, slug, description) values
  ('c1000000-0000-0000-0000-000000000001', 'Hand Tools', 'hand-tools', 'Hammers, wrenches, pliers, screwdrivers and more'),
  ('c1000000-0000-0000-0000-000000000002', 'Power Tools', 'power-tools', 'Drills, saws, grinders and electric equipment'),
  ('c1000000-0000-0000-0000-000000000003', 'Paint & Finishes', 'paint-finishes', 'Interior and exterior paint, brushes, rollers and spray'),
  ('c1000000-0000-0000-0000-000000000004', 'Electrical', 'electrical', 'Wiring tools, testers, multimeters and accessories'),
  ('c1000000-0000-0000-0000-000000000005', 'Plumbing & Garden', 'plumbing-garden', 'Pipes, fittings, plumbing tools and garden equipment');

-- 3. Insert products — Hand Tools
insert into public.products (name, slug, description, price, compare_at_price, stock, images, is_active, category_id) values
  ('Claw Hammer 16oz', 'claw-hammer-16oz',
   'Forged steel head with fiberglass handle and cushion grip. Anti-vibration design. Perfect for framing and general construction.',
   1899, 2499, 120,
   array['https://images.unsplash.com/photo-1586864387789-628af9feed72?w=600'],
   true, 'c1000000-0000-0000-0000-000000000001'),

  ('Adjustable Wrench Set 3-Piece', 'adjustable-wrench-set-3piece',
   'Chrome vanadium steel wrenches in 6", 8", and 10" sizes. Wide jaw capacity with precision laser-etched scale.',
   2499, 3299, 85,
   array['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600'],
   true, 'c1000000-0000-0000-0000-000000000001'),

  ('Professional Pliers Set 5-Piece', 'professional-pliers-set-5piece',
   'Includes needle-nose, diagonal cutter, slip-joint, groove-joint, and linesman pliers. Drop-forged steel with comfort grips.',
   3499, 4499, 60,
   array['https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=600'],
   true, 'c1000000-0000-0000-0000-000000000001'),

  ('Precision Screwdriver Kit 12-Piece', 'precision-screwdriver-kit-12piece',
   'Magnetic tips in Phillips, flathead, Torx, and hex sizes. Chrome vanadium blades with ergonomic soft-grip handles.',
   1999, null, 150,
   array['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600'],
   true, 'c1000000-0000-0000-0000-000000000001');

-- 4. Insert products — Power Tools
insert into public.products (name, slug, description, price, compare_at_price, stock, images, is_active, category_id) values
  ('Cordless Drill/Driver 20V', 'cordless-drill-driver-20v',
   'Brushless motor with 2-speed gearbox (0-500 / 0-2000 RPM). Includes two 2.0Ah lithium batteries, charger, and carrying case.',
   8999, 11999, 40,
   array['https://images.unsplash.com/photo-1504222490345-c075b6008014?w=600'],
   true, 'c1000000-0000-0000-0000-000000000002'),

  ('Circular Saw 7-1/4"', 'circular-saw-7-14',
   '15-amp motor with 5500 RPM for fast, clean cuts. Adjustable bevel up to 56°. Includes 24-tooth carbide blade and dust port.',
   6999, 8999, 25,
   array['https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=600'],
   true, 'c1000000-0000-0000-0000-000000000002'),

  ('Impact Driver Brushless Kit', 'impact-driver-brushless-kit',
   'Compact brushless impact driver delivering 1800 in-lbs of torque. 3-speed selector with LED work light. Battery and charger included.',
   12999, 15999, 30,
   array['https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600'],
   true, 'c1000000-0000-0000-0000-000000000002'),

  ('Angle Grinder 4-1/2"', 'angle-grinder-4-12',
   '11-amp motor with 11,000 RPM. Tool-free guard adjustment and paddle switch. Includes grinding wheel and flange kit.',
   4999, 5999, 45,
   array['https://images.unsplash.com/photo-1570215171323-4ec328f3f5fa?w=600'],
   true, 'c1000000-0000-0000-0000-000000000002');

-- 5. Insert products — Paint & Finishes
insert into public.products (name, slug, description, price, compare_at_price, stock, images, is_active, category_id) values
  ('Interior Latex Paint 1 Gallon', 'interior-latex-paint-1gal',
   'Premium acrylic latex with excellent coverage and washability. Low-VOC, low-odor formula. Eggshell finish in classic white.',
   3499, 4299, 80,
   array['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600'],
   true, 'c1000000-0000-0000-0000-000000000003'),

  ('Premium Paint Roller Kit 9"', 'premium-paint-roller-kit-9',
   'Heavy-duty frame with 3 microfiber roller covers (3/8" nap), extension pole, and paint tray. Smooth, lint-free finish.',
   2299, 2999, 95,
   array['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600'],
   true, 'c1000000-0000-0000-0000-000000000003'),

  ('Professional Paint Brush Set', 'professional-paint-brush-set',
   'Includes 1", 2", and 3" angled sash brushes with Chinex bristles. Stainless steel ferrule, hardwood handles. For all paint types.',
   1599, null, 110,
   array['https://images.unsplash.com/photo-1611117775350-ac3950990985?w=600'],
   true, 'c1000000-0000-0000-0000-000000000003'),

  ('Spray Paint Multi-Color 6-Pack', 'spray-paint-multi-color-6pack',
   'Fast-drying enamel spray paint in 6 popular colors. Indoor/outdoor use on wood, metal, and plastic. 12 oz cans with comfort tip.',
   2799, 3499, 65,
   array['https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=600'],
   true, 'c1000000-0000-0000-0000-000000000003');

-- 6. Insert products — Electrical
insert into public.products (name, slug, description, price, compare_at_price, stock, images, is_active, category_id) values
  ('Wire Stripper & Cutter Pro', 'wire-stripper-cutter-pro',
   'Self-adjusting wire stripper for 10-24 AWG. Built-in cutter and crimper. Spring-loaded with comfort grip handles.',
   1899, 2499, 70,
   array['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600'],
   true, 'c1000000-0000-0000-0000-000000000004'),

  ('Digital Multimeter Professional', 'digital-multimeter-professional',
   'True RMS multimeter with auto-ranging. Measures AC/DC voltage, current, resistance, capacitance, and frequency. CAT III 600V rated.',
   4999, 6499, 55,
   array['https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600'],
   true, 'c1000000-0000-0000-0000-000000000004'),

  ('Steel Tape Measure 25ft', 'steel-tape-measure-25ft',
   'Heavy-duty 25-foot tape with 1" wide blade and nylon coating. Magnetic hook tip, belt clip, and auto-lock mechanism.',
   1299, null, 200,
   array['https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=600'],
   true, 'c1000000-0000-0000-0000-000000000004'),

  ('Heavy-Duty Toolbox 22"', 'heavy-duty-toolbox-22',
   'Structural foam toolbox with metal latches and padlock eye. Removable tray with 12 compartments. Supports up to 50 lbs.',
   3999, 4999, 40,
   array['https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=600'],
   true, 'c1000000-0000-0000-0000-000000000004');

-- 7. Insert products — Plumbing & Garden
insert into public.products (name, slug, description, price, compare_at_price, stock, images, is_active, category_id) values
  ('PVC Pipe Assortment Kit', 'pvc-pipe-assortment-kit',
   'Includes 1/2", 3/4", 1", and 1-1/2" Schedule 40 PVC pipes (10 ft each) with matching elbows, tees, and couplings.',
   4499, 5499, 35,
   array['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600'],
   true, 'c1000000-0000-0000-0000-000000000005'),

  ('Plumber Tool Kit Complete', 'plumber-tool-kit-complete',
   'Everything you need: pipe wrench, basin wrench, plunger, Teflon tape, pipe cutter, and deburring tool in a zippered bag.',
   5999, 7499, 25,
   array['https://images.unsplash.com/photo-1605152276897-4f618f831968?w=600'],
   true, 'c1000000-0000-0000-0000-000000000005'),

  ('Garden Tool Set 5-Piece', 'garden-tool-set-5piece',
   'Stainless steel trowel, transplanter, cultivator, weeder, and pruning shears with ash wood handles and hanging holes.',
   2999, 3999, 50,
   array['https://images.unsplash.com/photo-1622050956578-94fd044a0ada?w=600'],
   true, 'c1000000-0000-0000-0000-000000000005'),

  ('Tool Wall Organizer System', 'tool-wall-organizer-system',
   'Modular pegboard system (4x2 ft) with 50 hooks, 6 bins, and 3 shelves. Heavy-gauge steel. Holds up to 200 lbs total.',
   7999, 9999, 20,
   array['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600'],
   true, 'c1000000-0000-0000-0000-000000000005');
