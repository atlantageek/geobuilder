CREATE OR REPLACE FUNCTION copy_schema_definitions(source_schema TEXT, target_schema TEXT, min_longitude real, min_latitude real, max_longitude real, max_latitude real) RETURNS void AS $$
DECLARE
    tbl RECORD;
    seq RECORD;
    table_ddl TEXT;
    sequence_ddl TEXT;
    has_sequence BOOLEAN;
BEGIN
    -- Create the target schema if it doesn't exist
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', target_schema);
        -- Copy table definitions. Loop and find all the tables in the source schema.
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = source_schema and table_type = 'BASE TABLE' and table_name not like 'spatial_ref_sys'
    LOOP
        -- Create table
        EXECUTE format(
            'CREATE TABLE %I.%I (LIKE %I.%I INCLUDING ALL)',
            target_schema, tbl.table_name, source_schema, tbl.table_name
        );
        select exists(select 1 from information_schema.sequences where sequence_name = tbl.table_name || '_id_seq') into has_sequence;
        EXECUTE format('INSERT into %I.%I SELECT * FROM %I.%I WHERE st_within(geometry,ST_TRANSFORM(ST_MakeEnvelope(%L::real,%L::real,%L::real,%L::real,4326),3857))', target_schema, tbl.table_name, source_schema, tbl.table_name,min_longitude,min_latitude,max_longitude,max_latitude);
        IF has_sequence THEN
            EXECUTE format(
                'CREATE SEQUENCE %I.%I OWNED BY %I.%I.%I',
                target_schema, tbl.table_name || '_id_seq', target_schema, tbl.table_name,  'id'
            );
            --Change ID fields to use the new sequence
            EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN id SET DEFAULT nextval(''%I.%I'')', target_schema, tbl.table_name, target_schema, tbl.table_name || '_id_seq');
            --Get Max value from source sequence and update the sequence
            --EXECUTE format('SELECT setval(''%I.%I'', (SELECT MAX(id) FROM %I.%I))', target_schema, tbl.table_name || '_id_seq', source_schema, tbl.table_name);
        END IF;
    END LOOP;
    EXECUTE format('CREATE TABLE %I.spatial_ref_sys (LIKE %I.spatial_ref_sys INCLUDING ALL)', target_schema, source_schema);
    EXECUTE format('INSERT into %I.spatial_ref_sys SELECT * FROM %I.spatial_ref_sys', target_schema, source_schema);
    EXECUTE format ('CREATE VIEW %I.geography_columns AS SELECT * FROM %I.geography_columns', target_schema, source_schema);
    EXECUTE format ('CREATE VIEW %I.geometry_columns AS SELECT * FROM %I.geometry_columns', target_schema, source_schema);
    -- Copy sequence definitions. Loop and find all the sequences in the source schema.
END;
$$ LANGUAGE plpgsql;



--https://stackoverflow.com/questions/12572088/duplicate-postgresql-schema-including-sequences
