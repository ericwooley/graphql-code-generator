import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import { ReactFormikRawPluginConfig } from './config';
import autoBind from 'auto-bind';
import { GraphQLSchema, OperationDefinitionNode, TypeNode, VariableDefinitionNode } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { camelCase, pascalCase } from 'change-case-all';

export interface ReactFormikConfig extends ClientSideBasePluginConfig {}

export class ReactFormikVisitor extends ClientSideBaseVisitor<ReactFormikRawPluginConfig, ReactFormikConfig> {
  private _operationsToInclude: {
    node: OperationDefinitionNode;
  }[] = [];
  private _mutations: {
    name: string;
    variables: (TypeNodeMetaData & { name: string })[];
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
  }

  public formikImports() {
    return [`import * as React from 'react';`, `import { Formik, Form, FormikConfig } from 'formik'`];
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    _documentVariableName: string,
    _operationType: string,
    _operationResultType: string,
    _operationVariablesTypes: string
  ): string {
    if (node.operation !== 'mutation') return null;
    const mutationData = {
      name: node.name.value,
      variables: node.variableDefinitions.map(varDefToVar),
    };
    this._mutations.push(mutationData);
    this._operationsToInclude.push({
      node,
    });

    return null;
  }

  renderFormElement(metaData: TypeNodeMetaData) {
    if (metaData.children) return metaData.children.map(this.renderFormElement);
    if (metaData.isPrimitive) return `<input type="${metaData.tsType}" />`;
    return metaData.tsType + ': ' + this._schema.getType(metaData.tsType).toJSON();
  }
  public get sdkContent() {
    return (
      `
/****************************
 * Formik Forms
 * *************************/
` +
      this._mutations
        .map(m => {
          const baseName = `${pascalCase(m.name)}Form`;
          return `
export const ${camelCase(m.name + 'DefaultValues')} = {
  ${m.variables.map(v => `${v.name}${v.optional ? '?' : ''}: undefined`).join(',\n')}
};

export interface ${baseName}Variables {
  ${m.variables.map(v => `${v.name}${v.optional ? '?' : ''}: ${v.tsType}`).join(',\n')}
}
export const ${baseName} = ({  initialValues, onSubmit, ...formikProps}: FormikConfig<${baseName}Variables>) => {
  return (<Formik onSubmit={onSubmit} initialValues={{...${camelCase(
    m.name + 'DefaultValues'
  )}, ...initialValues}} {...formikProps}>
    <Form>
    ${m.variables.map(v => this.renderFormElement(v)).join('\n    ')}
    </Form>
  </Formik>)
};
    `;
        })
        .join('\n')
    );
  }
}

const PrimitiveMaps: { [k: string]: { type: string; defaultVal: string } } = {
  Int: { type: 'Scalars.Int', defaultVal: JSON.stringify(0) },
  Float: { type: 'Scalars.Float', defaultVal: JSON.stringify(0) },
  String: { type: 'Scalars.String', defaultVal: JSON.stringify('') },
  Boolean: { type: 'Scalars.Boolean:', defaultVal: JSON.stringify(false) },
  ID: { type: 'Scalars.ID', defaultVal: JSON.stringify('') },
};

export function varDefToVar(varDef: VariableDefinitionNode): TypeNodeMetaData & { name: string } {
  const typeData = getTypeNodeMeta(varDef.type);
  return {
    ...typeData,
    name: varDef.variable.name.value,
  };
}

interface TypeNodeMetaData {
  tsType: string;
  defaultVal: string;
  optional: boolean;
  children?: Array<TypeNodeMetaData>;
  isPrimitive: boolean;
}

export function getTypeNodeMeta(type: TypeNode): TypeNodeMetaData {
  let tsType = '';
  let defaultVal = JSON.stringify('undefined');
  let optional = true;
  let children = undefined;
  let isPrimitive = false;
  if (type.kind === 'NamedType') {
    if (PrimitiveMaps[type.name.value]) {
      isPrimitive = true;
      tsType = PrimitiveMaps[type.name.value].type;
      defaultVal = PrimitiveMaps[type.name.value].defaultVal;
    } else {
      tsType = type.name.value;
    }
  } else if (type.kind === 'ListType') {
    children = getTypeNodeMeta(type.type);
    tsType = children.tsType + '[]';
    defaultVal = JSON.stringify([]);
  } else {
    optional = false;
    const lifted = getTypeNodeMeta(type.type);
    tsType = lifted.tsType;
    defaultVal = lifted.defaultVal;
  }
  return {
    isPrimitive,
    tsType,
    optional,
    defaultVal,
    children,
  };
}
