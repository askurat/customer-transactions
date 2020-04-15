import React from 'react';
import { render } from 'react-dom';
import {
  gql,
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import sumBy from 'lodash.sumby';
import isEqual from 'lodash.isequal';
import memoizeOne from 'memoize-one';
import { App } from '@/components/App';
import './index.less';

const typeDefs = gql`
  extend type User {
    points: Float
  }

  extend type Order {
    total: Float
  }
`;

const calculateTotal = (arr: [], field: string) => sumBy(arr, field);
const memoizeTotal = memoizeOne(calculateTotal, isEqual);

const calculatePoints = (total: number) => {
  if (total > 50) {
    if (total > 100) {
      return 2 * (total - 100) + 50;
    }

    return total - 50;
  }

  return 0;
};

const memoizePoints = memoizeOne(calculatePoints, isEqual);

const resolvers = {
  User: {
    points: ({ orders }: { orders: any }) => {
      let total = 0;
      orders.forEach((order: any) => {
        total += memoizeTotal(order.products, 'price');
      });
      return memoizePoints(total);
    },
  },
  Order: {
    total: ({ products }: { products: any }) => memoizeTotal(products, 'price'),
  },
};

const httpLink = new HttpLink({
  uri: 'https://fakeql.com/graphql/34192b3afe5bf4438095230f20abed8c',
});

const cache = new InMemoryCache();
const client = new ApolloClient({
  cache,
  // link: new SchemaLink({ schema })
  link: httpLink,
  typeDefs,
  resolvers,
  connectToDevTools: true,
});

const WrappedApp = (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);

render(WrappedApp, document.getElementById('root'));
