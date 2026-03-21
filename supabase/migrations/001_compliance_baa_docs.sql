CREATE TABLE IF NOT EXISTS public.baa_documents (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id     TEXT NOT NULL,
  vendor_name   TEXT NOT NULL,
  file_name     TEXT NOT NULL,
  storage_path  TEXT NOT NULL,
  file_size     BIGINT,
  uploaded_by   TEXT,
  signed_date   DATE,
  expiry_date   DATE,
  notes         TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.baa_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only" ON public.baa_documents
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'baa-documents',
  'baa-documents',
  false,
  10485760,
  ARRAY['application/pdf','image/png','image/jpeg','image/jpg']
)
ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Admin upload BAA docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'baa-documents'
    AND (auth.jwt() ->> 'role') = 'admin'
  );
CREATE POLICY "Admin read BAA docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'baa-documents'
    AND (auth.jwt() ->> 'role') = 'admin'
  );
