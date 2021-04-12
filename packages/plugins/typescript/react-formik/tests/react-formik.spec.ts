import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index';
import { parse, GraphQLSchema, buildClientSchema } from 'graphql';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { plugin as tsDocumentsPlugin } from '../../operations/src/index';

describe('React Apollo', () => {
  let spyConsoleError: jest.SpyInstance;
  beforeEach(() => {
    spyConsoleError = jest.spyOn(console, 'warn');
    spyConsoleError.mockImplementation();
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  const schema = buildClientSchema(require('../../../../../dev-test/star-wars/schema.json').data);
  const basicDoc = parse(/* GraphQL */ `
    query HeroAppearsIn {
      hero {
        name
        appearsIn
      }
    }
  `);
  const mutationDoc = parse(/* GraphQL */ `
    mutation CreateReviewForEpisode($episode: Episode!, $review: ReviewInput!) {
      createReview(episode: $episode, review: $review) {
        stars
        commentary
      }
    }
    # The input object sent when someone is creating a new review
    input ReviewInput {
      # 0-5 stars
      stars: Int!
      # Comment about the movie, optional
      commentary: String
      # Favorite color, optional
      favorite_color: ColorInput
    }
    # The episodes in the Star Wars trilogy
    enum Episode {
      # Star Wars Episode IV: A New Hope, released in 1977.
      NEWHOPE
      # Star Wars Episode V: The Empire Strikes Back, released in 1980.
      EMPIRE
      # Star Wars Episode VI: Return of the Jedi, released in 1983.
      JEDI
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
