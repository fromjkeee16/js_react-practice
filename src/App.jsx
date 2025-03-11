/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import classNames from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const FILTER_USERS_ALL_NAME = 'all';

const categories = categoriesFromServer.map(category => ({
  ...category,
  owner: usersFromServer.find(user => user.id === category.ownerId),
}));

const products = productsFromServer.map(product => {
  const category = categories.find(cat => cat.id === product.categoryId);
  const user = usersFromServer.find(usr => usr.id === category.ownerId);

  return { ...product, category, user };
});

const filterUsers = [...usersFromServer];
const tableFields = [
  { id: 1, name: 'ID' },
  { id: 2, name: 'Product' },
  { id: 3, name: 'Category' },
  { id: 4, name: 'User' },
];

// task 5 - selectedCategoryId = change int -> []
function filterGoods(goodsList, query, selectedUserId, selectedCategoryId) {
  let goods = [...goodsList];

  if (query) {
    goods = goods.filter(good => good.name.toLowerCase().includes(query));
  }

  if (selectedUserId !== FILTER_USERS_ALL_NAME) {
    goods = goods.filter(good => good.category.owner.id === selectedUserId);
  }

  if (selectedCategoryId.length > 0) {
    goods = goods.filter(good => selectedCategoryId.includes(good.category.id));
  }

  return goods;
}

function sortGoods(goodsList, field, reversed) {
  const goods = [...goodsList];

  if (field) {
    goods.sort((good1, good2) => {
      switch (field) {
        case 'id':
          return good1.id - good2.id;
        case 'product':
          return good1.name.localeCompare(good2.name);
        case 'category': {
          const cat1 = good1.category?.title || '';
          const cat2 = good2.category?.title || '';
          // return good1.category?.title?.localeCompare(good2.category?.title || '') doesnt work correctly

          return cat1.localeCompare(cat2);
        }

        case 'user': {
          const usr1 = good1.user?.name || '';
          const usr2 = good2.user?.name || '';

          return usr1.localeCompare(usr2);
        }

        default:
          return 0;
      }
    });
  }

  if (reversed) {
    goods.reverse();
  }

  return goods;
}

function prepareGoods(
  productList,
  query,
  selectedUserId,
  selectedCategoryId,
  field,
  reversed,
) {
  const filteredGoods = filterGoods(
    productList,
    query,
    selectedUserId,
    selectedCategoryId,
  );

  const sortedGoods = sortGoods(filteredGoods, field, reversed);

  return sortedGoods;
}

export const App = () => {
  const [query, setQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(FILTER_USERS_ALL_NAME);
  const [selectedCategoryId, setSelectedCategoryId] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [reversed, setReversed] = useState(false);

  const sanitizedQuery = query.trim().toLowerCase();

  const visibleProducts = prepareGoods(
    products,
    sanitizedQuery,
    selectedUserId,
    selectedCategoryId,
    sortBy,
    reversed,
  );

  const handleUserSelect = user => {
    setSelectedUserId(user);
  };

  const handleCategorySelect = category => {
    setSelectedCategoryId(prev => {
      if (!prev.includes(category)) {
        return [...prev, category];
      }

      return prev.toSpliced(prev.indexOf(category), 1);
    });
  };

  const handleCategoryClear = () => {
    setSelectedCategoryId([]);
  };

  const handleSearchChange = event => {
    setQuery(event.target.value);
  };

  const handleSearchClear = () => {
    setQuery('');
  };

  const handleFiltersClear = () => {
    handleCategoryClear();
    handleUserSelect(FILTER_USERS_ALL_NAME);
    handleSearchClear();
  };

  const handleSortField = field => {
    if (sortBy !== field) {
      setSortBy(field);
      setReversed(false);

      return;
    }

    if (!reversed) {
      setReversed(true);

      return;
    }

    setSortBy('');
    setReversed(false);
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
                  'is-outlined': selectedCategoryId.length,
                })}
                onClick={handleCategoryClear}
              >
                All
              </a>

              {categories.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={classNames('button', 'mr-2', 'my-1', {
                    'is-info': selectedCategoryId.includes(category.id),
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
                  {tableFields.map(field => {
                    const fieldName = field.name.toLowerCase();
                    const isSelected = fieldName === sortBy;

                    return (
                      <th key={field.id}>
                        <span className="is-flex is-flex-wrap-nowrap">
                          {field.name}
                          <a
                            href="#/"
                            onClick={() => handleSortField(fieldName)}
                          >
                            <span className="icon">
                              <i
                                data-cy="SortIcon"
                                className={classNames('fas', {
                                  'fa-sort': !isSelected,
                                  'fa-sort-up': isSelected && !reversed,
                                  'fa-sort-down': isSelected && reversed,
                                })}
                              />
                            </span>
                          </a>
                        </span>
                      </th>
                    );
                  })}
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
                        product.user.sex === 'm'
                          ? 'has-text-link'
                          : 'has-text-danger'
                      }
                    >
                      {product.user.name}
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
