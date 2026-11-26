CREATE TABLE public.airspace_publication (
    singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
    pending boolean NOT NULL
);

INSERT INTO public.airspace_publication (pending) VALUES (true);
