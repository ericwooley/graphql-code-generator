import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index';
import { parse, GraphQLSchema, buildSchema } from 'graphql';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { plugin as tsDocumentsPlugin } from '../../operations/src/index';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('React Apollo', () => {
  let spyConsoleError: jest.SpyInstance;
  beforeEach(() => {
    spyConsoleError = jest.spyOn(console, 'warn');
    spyConsoleError.mockImplementation();
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });
  const rawGqlFile = readFileSync(
    join(__dirname, '../../../../../dev-test/test-schema/schema-with-mutation.graphql')
  ).toString();

  const schema = buildSchema(rawGqlFile);
  const basicDoc = parse(/* GraphQL */ `
    query users {
      allUsers {
        id
      }
    }
  `);
  const mutationDoc = parse(/* GraphQL */ `
    mutation addUsers($users: [UserInput]!) {
      addUsers(users: $users) {
        id
      }
    }
  `);

  const validateTypeScript = async (
    output: Types.PluginOutput,
    testSchema: GraphQLSchema,
    documents: Types.DocumentFile[],
    config: any
  ) => {
    const tsOutput = await tsPlugin(testSchema, documents, config, { outputFile: '' });
    const tsDocumentsOutput = await tsDocumentsPlugin(testSchema, documents, config, { outputFile: '' });
    const merged = mergeOutputs([tsOutput, tsDocumentsOutput, output]);
    // process.stdout.write(`\n\n---------- merged \n${merged}\n`);
    validateTs(merged, undefined, true, false, [`Cannot find namespace 'Types'.`]);

    return merged;
  };

  describe('Imports', () => {
    it('should import React and Formik dependencies', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as React from 'react';`);
      expect(content.prepend).toContain(`import { Formik, Form, FormikConfig } from 'formik'`);
      await validateTypeScript(content, schema, docs, {});
    });
  });
  describe('Forms', () => {
    it('should generate a Form', async () => {
      const docs = [{ location: '', document: mutationDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;
      expect(content.content).toMatchSnapshot();
      await validateTypeScript(content, schema, docs, {});
    });

    it.skip('should generate Component', async () => {
      const docs = [{ location: '', document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
      export type TestComponentProps = Omit<ApolloReactComponents.QueryComponentOptions<TestQuery, TestQueryVariables>, 'query'>;
      `);

      expect(content.content).toBeSimilarStringTo(`
      export const TestComponent = (props: TestComponentProps) =>
      (
          <ApolloReactComponents.Query<TestQuery, TestQueryVariables> query={TestDocument} {...props} />
      );
      `);
      await validateTypeScript(content, schema, docs, {});
    });
  });
});
