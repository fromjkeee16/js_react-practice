/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import classNames from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const FILTER_USERS_ALL_NAME = 'all';
const FILTER_CATEGORIES_ALL_NAME = 'all';

const categories = categoriesFromServer.map(category => ({
  ...category,
  owner: usersFromServer.find(user => user.id === category.ownerId),
}));

const products = productsFromServer.map(product => ({
  ...product,
  category: categories.find(category => category.id === product.categoryId),
}));

const filterUsers = [...usersFromServer];

function prepareGoods(productList, query, selectedUserId, selectedCategoryId) {
  let goods = [...productList];

  if (query) {
    goods = goods.filter(good => good.name.toLowerCase().includes(query));
  }

  if (selectedUserId !== FILTER_USERS_ALL_NAME) {
    goods = goods.filter(good => good.category.owner.id === selectedUserId);
  }

  if (selectedCategoryId !== FILTER_CATEGORIES_ALL_NAME) {
    goods = goods.filter(good => good.category.id === selectedCategoryId);
  }

  return goods;
}

export const App = () => {
  const [selectedUserId, setSelectedUserId] = useState(FILTER_USERS_ALL_NAME);
  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    FILTER_CATEGORIES_ALL_NAME,
  );
  const sanitizedQuery = query.trim().toLowerCase();

  const visibleProducts = prepareGoods(
    products,
    sanitizedQuery,
    selectedUserId,
    selectedCategoryId,
  );

  const handleUserSelect = user => {
    setSelectedUserId(user);
  };

  const handleCategorySelect = category => {
    setSelectedCategoryId(category);
  };

  const handleSearchChange = event => {
    setQuery(event.target.value);
  };

  const handleSearchClear = () => {
    setQuery('');
  };

  const handleFiltersClear = () => {
    handleCategorySelect(FILTER_CATEGORIES_ALL_NAME);
    handleUserSelect(FILTER_USERS_ALL_NAME);
    handleSearchClear();
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                onClick={() => handleUserSelect(FILTER_USERS_ALL_NAME)}
                className={classNames({
                  'is-active': selectedUserId === FILTER_USERS_ALL_NAME,
                })}
              >
                All
              </a>

              {filterUsers.map(user => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  key={user.id}
                  onClick={() => handleUserSelect(user.id)}
                  className={classNames({
                    'is-active': user.id === selectedUserId,
                  })}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={handleSearchChange}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {sanitizedQuery && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={handleSearchClear}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={classNames('button', 'is-success', 'mr-6', {
                  'is-outlined':
                    selectedCategoryId !== FILTER_CATEGORIES_ALL_NAME,
                })}
                onClick={() => handleCategorySelect(FILTER_CATEGORIES_ALL_NAME)}
              >
                All
              </a>

              {categories.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={classNames('button', 'mr-2', 'my-1', {
                    'is-info': selectedCategoryId === category.id,
                  })}
                  href="#/"
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={handleFiltersClear}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {visibleProducts.length ? (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className="fas fa-sort" />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className="fas fa-sort-down" />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className="fas fa-sort-up" />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className="fas fa-sort" />
                        </span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(product => (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category.icon} - {product.category.title}
                    </td>

                    <td
                      data-cy="ProductUser"
                      className={
                        product.category.owner.sex === 'm'
                          ? 'has-text-link'
                          : 'has-text-danger'
                      }
                    >
                      {product.category.owner.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
