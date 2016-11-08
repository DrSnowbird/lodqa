'use strict';

var dashboard = document.querySelector('#dashboard'),
    results = document.querySelector('#results');

dashboard.addEventListener('click', function () {
  dashboard.classList.remove('dashboard--back');
  results.classList.add('results--back');
});

results.addEventListener('click', function () {
  dashboard.classList.add('dashboard--back');
  results.classList.remove('results--back');
});