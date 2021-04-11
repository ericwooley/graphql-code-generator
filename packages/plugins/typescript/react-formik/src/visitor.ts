import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import { ReactFormikRawPluginConfig } from './config';
import autoBind from 'auto-bind';
import { GraphQLSchema, OperationDefinitionNode } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { camelCase, pascalCase } from 'change-case-all';

export interface ReactFormikConfig extends ClientSideBasePluginConfig {}

export class ReactFormikVisitor extends ClientSideBaseVisitor<ReactFormikRawPluginConfig, ReactFormikConfig> {
  private _operationsToInclude: {
    node: OperationDefinitionNode;
  }[] = [];
  private _mutations: {
    name: string;
    variables: {
      name: string;
      optional: boolean;
    }[];
  }[] = [];
  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    protected rawConfig: ReactFormikRawPluginConfig,
    documents: Types.DocumentFile[]
  ) {
    super(schema, fragments, rawConfig, {});
    this._documents = documents;
    autoBind(this);
    this._addImports();
  }

  private _addImports() {
    this._additionalImports.push(`import * as React from 'react';`);
    this._additionalImports.push(`import { Formik, Form } from 'formik'`);
  }
  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    if (node.operation !== 'mutation') return null;
    const mutationData = {
      name: node.name.value,
      variables: node.variableDefinitions.map(vd => ({
        name: vd.variable.name.value,
        optional: vd.type.kind !== 'NonNullType',
      })),
    };
    this._mutations.push(mutationData);
    this._operationsToInclude.push({
      node,
    });

    return null;
  }

  public get sdkContent() {
    return this._mutations
      .map(
        m => `
        export const ${camelCase(m.name + 'DefaultValues')} = {
          ${m.variables.map(v => `${v.name}${v.optional ? '?' : ''}: undefined`).join(',\n')}
        };
        export const ${pascalCase(m.name)}Form = () => {
          return (<Formik></Formik>)
        };
    `
      )
      .join('\n');
  }
}
