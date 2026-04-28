---
name: create-pipe
description: How to create a new pipe
---

# Create Pipe

Generate a new Angular pipe for the see-sea Ionic project.

## Instructions

You are working in an Ionic/Angular. The project has a pipes folder at `src/app/shared/pipes/`.

When asked to create a pipe:
1. Ask the user for the pipe name and its purpose
2. Create the pipe file following the naming convention: `{name}-pipe.ts`
3. Create a corresponding spec file: `{name}-pipe.spec.ts` 
4. Use the `@Pipe` decorator with proper metadata
5. Implement the `PipeTransform` interface with the `transform()` method
6. Export the pipe class
7. Add basic unit tests in the spec file

## Naming Convention

- Pipe files: `{descriptive-name}-pipe.ts`
- Spec files: `{descriptive-name}-pipe.spec.ts`
- Class names: Use PascalCase, e.g., `DiaSemanaPipe` for `dia-semana-pipe.ts`


## Implement transformation logic: `transform()` method

1. Posibles param values: Find in src/app/models/*.ts the interface `{name}` and inspect posibles values defined in interface. Example:f1: '210' | '220' | '230' | string;
2. Return values: Find in ./assets/JSonSchema_AEMET_playa.json `{name}` tag inspect "description" text attribute to match return values for param values. 
3. Use this "description" json attribute as example: "descripcion": "C�digo de estado de cielo por la ma�ana. Posibles valores 100 despejado, 110 nuboso, 120 muy nuboso, 130 chubascos, 140 muy nuboso con lluvia". Param values: {100,110,120,130,140} with return values: {despejado,nuboso,muy nuboso,chubascos,muy nuboso con lluvia}


## Files to Create

- `src/app/shared/pipes/{name}-pipe.ts` - Main pipe implementation
- `src/app/shared/pipes/{name}-pipe.spec.ts` - Unit tests

After creating the files, ensure they are properly integrated and tested in the project.
