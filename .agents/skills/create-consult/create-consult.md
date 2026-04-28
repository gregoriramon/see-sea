---
name: create-consult
description: How to create a new consult to consum API supabase
---


# Create Consults 

Generate a new consult to get data (resource) from supabase service

## Instructions

All consult must be defined in ts file at `src/app/core/services/supabase/supabase.ts`.

When asked to create a consult:

1. Ask the user for the input to know the resource and columns names defined on supabase database api:get `{name-resource}` + By + `{name-columns}`
2. Examine src/app/models/*.ts to locate the apropriate resource interface
3. Create the corresponding supabase select method with this format: get`{name-resoruce}`By`name-columns[0]`And`name-columns[1]` and so on..
4. Allways create an addional select method:  get`{name-resource}`All , if not already exists, and use it inside de new consult if all params are empty,null or empty array o size===0
5. The method have to deal with one-value o several values, for instance `param-1='value-1'` or an array of values `{param-1:'value-1, param-2:'value-2'`
6. Use `.ilike` for one-value param or `.in` for several values param
7. If there are not `{name-columns}` use just getAll`{name-resoruce}`


## Body example of implementation method for getProvinciaByNameAndCodProvincia input

```javascript
   async getProvinciaAll(): Promise<Provincia[]> {

    const { data, error } = await this.supabase
      .from('provincia')
      .select('*');

    if (error) {
      console.error('Error al obtener todas las provincias:', error);
      return [];
    }

    return data as Provincia[];
  }

  async getProvinciaByNameAndCodProvincia(name: string | null, codProvincia: string | string[] | null): Promise<Provincia[]> {

    // If empty string, null, or empty array for both params, return all provincias
    if ((name === null || name === '') &&
        (codProvincia === null ||
         (typeof codProvincia === 'string' && codProvincia === '') ||
         (Array.isArray(codProvincia) && codProvincia.length === 0))) {
      return this.getProvinciaAll();
    }

    let query = this.supabase
      .from('provincia')
      .select('*');

    // Apply name filter if provided
    if (name && name !== '') {
      query = query.ilike('provincia', "%".concat(name).concat('%'));
    }

    // Apply codProvincia filter if provided
    if (codProvincia !== null && !(typeof codProvincia === 'string' && codProvincia === '') && !(Array.isArray(codProvincia) && codProvincia.length === 0)) {
      if (Array.isArray(codProvincia)) {
        query = query.in('cod_provincia', codProvincia);
      } else {
        query = query.eq('cod_provincia', codProvincia);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener provincias:', error);
      return [];
    }

    return data as Provincia[];
  }
  ```

## Naming Method Convention

 Method name: get `{name-resource}` By`{name-column-1}` And `{name-columns-2}`
 Method name with columns: getAll `{name-resource}` 
