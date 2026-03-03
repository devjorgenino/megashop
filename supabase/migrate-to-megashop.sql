-- ============================================
-- MIGRACIÓN: Catálogo de Tienda General MegaShop
-- Reemplaza productos de hardware con datos de tienda multi-categoría.
-- Ejecutar en el Editor SQL de Supabase.
-- ============================================

-- 1. Limpiar datos existentes (el orden importa por restricciones de FK)
delete from public.order_items;
delete from public.orders;
delete from public.cart_items;
delete from public.products;
delete from public.categories;

-- 2. Insertar nuevas categorías
insert into public.categories (id, name, slug, description) values
  ('c1000000-0000-0000-0000-000000000001', 'Electrónica', 'electronics', 'Smartphones, laptops, televisores, accesorios y gadgets'),
  ('c1000000-0000-0000-0000-000000000002', 'Ropa y Moda', 'clothing', 'Ropa para hombres y mujeres, zapatos y accesorios'),
  ('c1000000-0000-0000-0000-000000000003', 'Muebles', 'furniture', 'Sofás, sillas, mesas, camas y decoración del hogar'),
  ('c1000000-0000-0000-0000-000000000004', 'Deportes y Fitness', 'sports', 'Equipos de gimnasio, ropa deportiva, exterior y fitness'),
  ('c1000000-0000-0000-0000-000000000005', 'Belleza y Salud', 'beauty', 'Cuidado de la piel, maquillaje, fragancias y cuidado personal'),
  ('c1000000-0000-0000-0000-000000000006', 'Alimentos y Bebidas', 'food', 'Comida gourmet, snacks, bebidas y productos orgánicos');

-- 3. Insertar nuevos productos (Electrónica)
insert into public.products (name, slug, description, price, compare_at_price, stock, images, is_active, category_id) values
  ('Samsung Galaxy Smartphone', 'samsung-galaxy-smartphone',
   'Pantalla Infinity-O, 128GB de almacenamiento, 8GB de RAM. Sistema de triple cámara con sensor principal de 108MP. Habilitado para 5G con batería de todo el día.',
   69999, 89999, 40,
   array['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'],
   true, 'c1000000-0000-0000-0000-000000000001'),

  ('Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones',
   'Audífonos premium supraaurales con cancelación activa de ruido. 40 horas de batería, soporte de audio Hi-Res y diseño plegable.',
   12999, 16999, 80,
   array['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
   true, 'c1000000-0000-0000-0000-000000000001'),

  ('LED Smart Television 55"', 'led-smart-television-55',
   'Smart TV 4K Ultra HD con HDR10. Apps de streaming integradas, compatible con asistente de voz. Tasa de refresco de 120Hz para imágenes fluidas.',
   59999, 79999, 0,
   array['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'],
   true, 'c1000000-0000-0000-0000-000000000001'),

  ('Wireless Gaming Mouse', 'wireless-gaming-mouse',
   'Ultraliviano de 63g. Sensor óptico de 25K DPI, 70 horas de batería. Iluminación RGB con 6 botones programables.',
   4999, 6999, 120,
   array['https://images.unsplash.com/photo-1527814050087-3793815479db?w=600'],
   true, 'c1000000-0000-0000-0000-000000000001');

-- Productos — Ropa y Moda
insert into public.products (name, slug, description, price, compare_at_price, stock, images, is_active, category_id) values
  ('Classic Fit Casual Shirt', 'classic-fit-casual-shirt',
   'Camisa casual de algodón premium en corte clásico moderno. Disponible en múltiples colores. Lavable a máquina, tela resistente a las arrugas.',
   3999, 5999, 150,
   array['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'],
   true, 'c1000000-0000-0000-0000-000000000002'),

  ('Women Designer Sunglasses', 'women-designer-sunglasses',
   'Lentes polarizados con protección UV400. Montura de acetato italiano con acentos metálicos dorados. Incluye estuche premium.',
   8999, 12999, 60,
   array['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600'],
   true, 'c1000000-0000-0000-0000-000000000002'),

  ('Leather Crossbody Bag', 'leather-crossbody-bag',
   'Bolso de cuero genuino de grano completo con correa ajustable. Múltiples compartimentos con bolsillo bloqueador de RFID. Acabado artesanal.',
   7999, 9999, 45,
   array['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'],
   true, 'c1000000-0000-0000-0000-000000000002'),

  ('Running Sneakers Pro', 'running-sneakers-pro',
   'Parte superior de malla liviana con entresuela de espuma reactiva. Suela de goma con patrón de tracción. Diseño transpirable y flexible.',
   6499, null, 90,
   array['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
   true, 'c1000000-0000-0000-0000-000000000002');

-- Productos — Muebles
insert into public.products (name, slug, description, price, compare_at_price, stock, images, is_active, category_id) values
  ('Modern Arm Chair', 'modern-arm-chair',
   'Diseño moderno de mediados de siglo con patas de roble sólido. Tapizado premium en gris neutro. Pieza de acento perfecta para sala u oficina.',
   29999, 39999, 15,
   array['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'],
   true, 'c1000000-0000-0000-0000-000000000003'),

  ('Minimalist Working Desk', 'minimalist-working-desk',
   'Escritorio de líneas limpias con superficie espaciosa de 122 x 61 cm. Tope de madera sólida con estructura de acero con recubrimiento en polvo. Incluye pasacables.',
   19999, 24999, 25,
   array['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600'],
   true, 'c1000000-0000-0000-0000-000000000003'),

  ('Velvet Sofa 3-Seater', 'velvet-sofa-3-seater',
   'Lujoso tapizado de terciopelo con cojines de espuma de alta densidad. Estructura de madera sólida con patas metálicas doradas. Asiento profundo para máximo confort.',
   49999, 64999, 8,
   array['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600'],
   true, 'c1000000-0000-0000-0000-000000000003'),

  ('Ceramic Table Lamp', 'ceramic-table-lamp',
   'Base de cerámica artesanal con pantalla de tambor de lino. Luz cálida suave con interruptor de 3 vías. Altura: 61 cm. Compatible con bombillas E26 estándar.',
   5999, 7999, 50,
   array['https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600'],
   true, 'c1000000-0000-0000-0000-000000000003');

-- Productos — Deportes y Fitness
insert into public.products (name, slug, description, price, compare_at_price, stock, images, is_active, category_id) values
  ('Adjustable Dumbbell Set', 'adjustable-dumbbell-set',
   'Sistema de cambio rápido de peso de 2.3 a 23.8 kg por mancuerna. Reemplaza 15 juegos de pesas. Diseño compacto que ahorra espacio.',
   29999, 39999, 30,
   array['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600'],
   true, 'c1000000-0000-0000-0000-000000000004'),

  ('Yoga Mat Premium', 'yoga-mat-premium',
   'Esterilla de yoga extra gruesa de 6mm antideslizante. Material TPE ecológico. Incluye correa de transporte. 183 x 61 cm para todos los tipos de cuerpo.',
   2999, 3999, 100,
   array['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600'],
   true, 'c1000000-0000-0000-0000-000000000004'),

  ('Smart Fitness Watch', 'smart-fitness-watch',
   'Monitor de ritmo cardíaco, seguimiento GPS, análisis de sueño. 14 días de batería. Resistente al agua hasta 50m. Compatible con iOS y Android.',
   14999, 19999, 65,
   array['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600'],
   true, 'c1000000-0000-0000-0000-000000000004'),

  ('Resistance Bands Set', 'resistance-bands-set',
   'Set de 5 niveles de resistencia con asas, anclaje de puerta y correas para tobillos. Bandas de TPE sin látex. Perfecto para entrenamientos en casa.',
   1999, 2999, 200,
   array['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600'],
   true, 'c1000000-0000-0000-0000-000000000004');

-- Productos — Belleza y Salud
insert into public.products (name, slug, description, price, compare_at_price, stock, images, is_active, category_id) values
  ('Luxury Skincare Set', 'luxury-skincare-set',
   'Rutina completa de cuidado de la piel en 5 pasos: limpiador, tónico, sérum, hidratante y crema de ojos. Probado por dermatólogos, fórmula libre de crueldad.',
   7999, 10999, 40,
   array['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'],
   true, 'c1000000-0000-0000-0000-000000000005'),

  ('Designer Perfume Collection', 'designer-perfume-collection',
   'Set de 4 mini fragancias de diseñador (15ml cada una). Fórmula de larga duración con notas de jazmín, ámbar, vainilla y sándalo.',
   5999, 7999, 55,
   array['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600'],
   true, 'c1000000-0000-0000-0000-000000000005'),

  ('Professional Hair Dryer', 'professional-hair-dryer',
   'Tecnología iónica para secado rápido con menos frizz. Motor de 1875W con 3 niveles de calor y 2 velocidades. Incluye difusor y concentrador.',
   4999, null, 70,
   array['https://images.unsplash.com/photo-1522338242992-e1a54571a9f7?w=600'],
   true, 'c1000000-0000-0000-0000-000000000005');

-- Productos — Alimentos y Bebidas
insert into public.products (name, slug, description, price, compare_at_price, stock, images, is_active, category_id) values
  ('Artisan Coffee Collection', 'artisan-coffee-collection',
   'Set de 3 cafés de origen único en grano entero de Etiopía, Colombia y Guatemala. Tostado medio-oscuro. Bolsas de 340g, recién tostado.',
   3499, 4499, 80,
   array['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600'],
   true, 'c1000000-0000-0000-0000-000000000006'),

  ('Organic Tea Sampler Box', 'organic-tea-sampler-box',
   'Selección curada de 12 tés orgánicos: verde, negro, blanco, herbal y chai. Cada bolsa de té envuelta individualmente.',
   2499, 2999, 120,
   array['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600'],
   true, 'c1000000-0000-0000-0000-000000000006'),

  ('Gourmet Chocolate Gift Box', 'gourmet-chocolate-gift-box',
   'Surtido de chocolates belgas en una elegante caja de regalo. Trufas de chocolate oscuro, con leche y blanco. 24 piezas, decoradas a mano.',
   3999, 4999, 45,
   array['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600'],
   true, 'c1000000-0000-0000-0000-000000000006');
