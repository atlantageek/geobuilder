create or replace function get_current_region()
    returns geometry as
$$
begin
    return ST_GeomFromText(current_setting('saas_user.region'));
end
$$ language plpgsql stable;

create or replace function set_current_region(xmin float, ymin float, xmax float,ymax float)
    returns void as
$$
begin
    perform set_config('saas_user.region', st_astext(ST_MakeEnvelope(xmin,ymin,xmax,ymax)), false);

end
$$ language plpgsql volatile;