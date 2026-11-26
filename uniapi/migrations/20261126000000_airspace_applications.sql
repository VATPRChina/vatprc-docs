CREATE TABLE public.airspace_application (
    id uuid PRIMARY KEY,
    applicant_id uuid NOT NULL REFERENCES public."user"(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    category text NOT NULL CHECK (category IN ('Restricted', 'Danger', 'Prohibit')),
    lower_ft integer NOT NULL,
    upper_ft integer NOT NULL CHECK (upper_ft >= lower_ft),
    label text NOT NULL,
    remarks text,
    boundary jsonb NOT NULL,
    status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
    reviewer_id uuid REFERENCES public."user"(id),
    reviewed_at timestamptz,
    review_comment text,
    CHECK (ends_at > starts_at)
);

CREATE INDEX ix_airspace_application_created_at ON public.airspace_application (created_at DESC);
