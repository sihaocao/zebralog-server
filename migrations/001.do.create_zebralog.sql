CREATE TABLE zebralogs (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    game_date TEXT NOT NULL,
    site TEXT NOT NULL,
    distance NUMERIC DEFAULT 0 NOT NULL,
    paid TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    notes TEXT NOT NULL
)