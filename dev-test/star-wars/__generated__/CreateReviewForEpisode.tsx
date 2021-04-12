import * as Types from '../types.d';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import * as React from 'react';
import { Formik, Form, FormikConfig } from 'formik';
const defaultOptions = {};
export type CreateReviewForEpisodeMutationVariables = Types.Exact<{
  episode: Types.Episode;
  review: Types.ReviewInput;
}>;

export type CreateReviewForEpisodeMutation = { __typename?: 'Mutation' } & {
  createReview?: Types.Maybe<{ __typename?: 'Review' } & Pick<Types.Review, 'stars' | 'commentary'>>;
};

export const CreateReviewForEpisodeDocument = gql`
  mutation CreateReviewForEpisode($episode: Episode!, $review: ReviewInput!) {
    createReview(episode: $episode, review: $review) {
      stars
      commentary
    }
  }
`;
export type CreateReviewForEpisodeMutationFn = Apollo.MutationFunction<
  CreateReviewForEpisodeMutation,
  CreateReviewForEpisodeMutationVariables
>;

/**
 * __useCreateReviewForEpisodeMutation__
 *
 * To run a mutation, you first call `useCreateReviewForEpisodeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReviewForEpisodeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReviewForEpisodeMutation, { data, loading, error }] = useCreateReviewForEpisodeMutation({
 *   variables: {
 *      episode: // value for 'episode'
 *      review: // value for 'review'
 *   },
 * });
 */
export function useCreateReviewForEpisodeMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateReviewForEpisodeMutation, CreateReviewForEpisodeMutationVariables>(
    CreateReviewForEpisodeDocument,
    options
  );
}
export type CreateReviewForEpisodeMutationHookResult = ReturnType<typeof useCreateReviewForEpisodeMutation>;
export type CreateReviewForEpisodeMutationResult = Apollo.MutationResult<CreateReviewForEpisodeMutation>;
export type CreateReviewForEpisodeMutationOptions = Apollo.BaseMutationOptions<
  CreateReviewForEpisodeMutation,
  CreateReviewForEpisodeMutationVariables
>;

/****************************
 * Formik Forms
 * *************************/

export const createReviewForEpisodeDefaultValues = {
  episode: undefined,
  review: undefined,
};

export interface CreateReviewForEpisodeFormVariables {
  episode: string;
  review: ReviewInput;
}
export const CreateReviewForEpisodeForm = ({
  initialValues,
  onSubmit,
  ...formikProps
}: FormikConfig<CreateReviewForEpisodeFormVariables>) => {
  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={{ ...createReviewForEpisodeDefaultValues, ...initialValues }}
      {...formikProps}
    >
      <Form>
        <label>
          <h5>episode</h5>
          <input name="episode" type="string" />
        </label>
        <div>
          <h4>review</h4>
          <label>
            <h5>review.stars</h5>
            <input name="review.stars" type="Scalars.Int" />
          </label>
          <label>
            <h5>review.commentary</h5>
            <input name="review.commentary" type="Scalars.String" />
          </label>
          <div>
            <h4>review.favoriteColor</h4>
            <label>
              <h5>review.favoriteColor.red</h5>
              <input name="review.favoriteColor.red" type="Scalars.Int" />
            </label>
            <label>
              <h5>review.favoriteColor.green</h5>
              <input name="review.favoriteColor.green" type="Scalars.Int" />
            </label>
            <label>
              <h5>review.favoriteColor.blue</h5>
              <input name="review.favoriteColor.blue" type="Scalars.Int" />
            </label>
          </div>
        </div>
      </Form>
    </Formik>
  );
};
