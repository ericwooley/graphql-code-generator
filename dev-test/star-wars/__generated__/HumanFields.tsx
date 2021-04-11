import * as Types from '../types.d';

import { gql } from '@apollo/client';
import * as React from 'react';
import { Formik, Form, FormikConfig } from 'formik';
export type HumanFieldsFragment = { __typename?: 'Human' } & Pick<Types.Human, 'name' | 'mass'>;

export const HumanFieldsFragmentDoc = gql`
  fragment HumanFields on Human {
    name
    mass
  }
`;

/****************************
 * Formik Forms
 * *************************/
