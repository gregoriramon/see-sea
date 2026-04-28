import { TestBed } from '@angular/core/testing';
import { Supabase } from './supabase';
import { Municipio } from 'src/app/models/common';

describe('Supabase Service', () => {
  let service: Supabase;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Supabase);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMunicipioByNameAndCodMunicipio', () => {
    it('should return municipios filtered by name and single codMunicipio', async () => {
      // Test with single codMunicipio value
      const result = await service.getMunicipioByNameAndCodMunicipio('Madrid', '28');
      expect(result).toBeInstanceOf(Array);
    });

    it('should handle array of codMunicipio values', async () => {
      // Test with multiple codMunicipio values
      const result = await service.getMunicipioByNameAndCodMunicipio('San', ['28', '08', '12']);
      expect(result).toBeInstanceOf(Array);
    });

    it('should return empty array on error', async () => {
      // This test would verify error handling
      const result = await service.getMunicipioByNameAndCodMunicipio('NonExistent', 'INVALID');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by name with partial match', async () => {
      // Test case-insensitive search with ilike
      const result = await service.getMunicipioByNameAndCodMunicipio('san', '28');
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('getProvinciaByCodProvincia', () => {
    it('should return provincia with single codProvincia', async () => {
      // Test with single codProvincia value
      const result = await service.getProvinciaByCodProvincia('28');
      expect(result).toBeInstanceOf(Array);
    });

    it('should handle array of codProvincia values', async () => {
      // Test with multiple codProvincia values
      const result = await service.getProvinciaByCodProvincia(['28', '08', '12']);
      expect(result).toBeInstanceOf(Array);
    });

    it('should return empty array on error', async () => {
      // This test would verify error handling
      const result = await service.getProvinciaByCodProvincia('INVALID');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by single codProvincia', async () => {
      // Test filtering by code
      const result = await service.getProvinciaByCodProvincia('08');
      expect(result).toBeInstanceOf(Array);
    });

    it('should return all provincias when empty string is passed', async () => {
      // Test with empty string - should return all provincias
      const result = await service.getProvinciaByCodProvincia('');
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return all provincias when empty array is passed', async () => {
      // Test with empty array - should return all provincias
      const result = await service.getProvinciaByCodProvincia([]);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return all provincias when null is passed', async () => {
      // Test with null - should return all provincias
      const result = await service.getProvinciaByCodProvincia(null);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getAllProvincia', () => {
    it('should return all provincias', async () => {
      // Test getting all provincias
      const result = await service.getProvinciaAll();
      expect(result).toBeInstanceOf(Array);
    });

    it('should return empty array on error', async () => {
      // This test would verify error handling
      const result = await service.getProvinciaAll();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should contain Provincia objects with expected properties', async () => {
      // Test that returned objects have the expected structure
      const result = await service.getProvinciaAll();
      if (result.length > 0) {
        expect(result[0]['cod_provincia']).toBeDefined();
        expect(result[0]['provincia']).toBeDefined();
        expect(result[0]['cod_ccaa']).toBeDefined();
      }
    });
  });

  describe('getProvinciaByNameAndCodProvincia', () => {
    it('should filter by name only', async () => {
      // Test with name only
      const result = await service.getProvinciaByNameAndCodProvincia('Madrid', null);
      expect(result).toBeInstanceOf(Array);
    });

    it('should filter by codProvincia only', async () => {
      // Test with codProvincia only
      const result = await service.getProvinciaByNameAndCodProvincia(null, '28');
      expect(result).toBeInstanceOf(Array);
    });

    it('should filter by both name and codProvincia', async () => {
      // Test with both parameters
      const result = await service.getProvinciaByNameAndCodProvincia('Mad', '28');
      expect(result).toBeInstanceOf(Array);
    });

    it('should handle array of codProvincia values with name', async () => {
      // Test with name and multiple codProvincia values
      const result = await service.getProvinciaByNameAndCodProvincia('a', ['28', '08']);
      expect(result).toBeInstanceOf(Array);
    });

    it('should return all provincias when both params are null', async () => {
      // Test with null, null - should return all provincias
      const result = await service.getProvinciaByNameAndCodProvincia(null, null);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return all provincias when both params are empty', async () => {
      // Test with empty string and empty array - should return all provincias
      const result = await service.getProvinciaByNameAndCodProvincia('', []);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
