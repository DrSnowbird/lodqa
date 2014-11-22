var _ = require('lodash'),
  instance = require('./instance'),
  transformIf = function(predicate, transform, object) {
    return predicate(object) ? transform(object) : object;
  },
  Graph = function(domId, options) {
    var graph = new Springy.Graph();
    var canvas = $('<canvas>')
      .attr(options);

    $('#' + domId).append(canvas);
    canvas.springy({
      graph: graph
    });

    return graph;
  },
  toAnchoredPgpNodeTerm = function(nodes, key) {
    return {
      id: key,
      label: nodes[key].term
    };
  },
  toLabel = function(term) {
    return {
      id: term.id,
      label: require('./toLastOfUrl')(term.label)
    };
  },
  setFont = function(value, target) {
    return _.extend(target, {
      font: value
    })
  },
  setFontNormal = _.partial(setFont, '8px Verdana, sans-serif'),
  toLabelAndSetFontNormal = _.compose(setFontNormal, toLabel),
  toNode = function(term) {
    return new Springy.Node(term.id, term);
  },
  addNode = function(graph, node) {
    graph.addNode(node);
  },
  toBigFont = _.partial(setFont, '18px Verdana, sans-serif'),
  toRed = function(term) {
    return _.extend(term, {
      color: '#FF512C'
    });
  },
  toFocus = _.compose(toRed, toBigFont),
  setFocus = function(focus, term) {
    return term.id === focus ? toFocus(term) : term;
  },
  extendIndex = function(a, index) {
    a.index = index;
    return a;
  },
  threeNodeOrders = {
    t1: [1, 0, 2],
    t2: [0, 1, 2],
    t3: [0, 2, 1]
  },
  getNodeOrder = function(id) {
    return threeNodeOrders[id];
  },
  getTwoEdgeNode = function(edgeCount) {
    return _.first(Object.keys(edgeCount)
      .map(function(id) {
        return {
          id: id,
          count: edgeCount[id]
        };
      })
      .filter(function(node) {
        return node.count === 2;
      })
      .map(function(node) {
        return node.id;
      }));
  },
  countEdge = function(edges) {
    return edges.reduce(function(edgeCount, edge) {
      edgeCount[edge.subject] ++;
      edgeCount[edge.object] ++;
      return edgeCount;
    }, {
      t1: 0,
      t2: 0,
      t3: 0
    });
  },
  getOrderWhenThreeNode = _.compose(getNodeOrder, getTwoEdgeNode, countEdge),
  sortNode = function(nodeIds, edges, a, b) {
    if (nodeIds.length === 3) {
      var nodeOrder = getOrderWhenThreeNode(edges);

      return nodeOrder[a.index] - nodeOrder[b.index];
    } else {
      return b.index - a.index;
    }
  },
  anchoredPgpNodePositions = [
    [],
    [{
      x: 0,
      y: 0
    }],
    [{
      x: -20,
      y: 20
    }, {
      x: 20,
      y: -20
    }],
    [{
      x: -40,
      y: 40
    }, {
      x: 0,
      y: 0
    }, {
      x: 40,
      y: -40
    }]
  ],
  setPosition = function(number_of_nodes, term, index) {
    return _.extend(term, {
      position: anchoredPgpNodePositions[number_of_nodes][index]
    });
  },
  addAnchoredPgpNodes = function(graph, anchoredPgp) {
    var nodeIds = Object.keys(anchoredPgp.nodes);

    nodeIds
      .map(_.partial(toAnchoredPgpNodeTerm, anchoredPgp.nodes))
      .map(toLabelAndSetFontNormal)
      .map(_.partial(setFocus, anchoredPgp.focus))
      .map(extendIndex)
      .sort(_.partial(sortNode, nodeIds, anchoredPgp.edges))
      .map(_.partial(setPosition, nodeIds.length))
      .map(toNode)
      .forEach(_.partial(addNode, graph));
  },
  toTerm = function(solution, id) {
    return {
      id: id,
      label: solution[id]
    };
  },
  addEdge = function(graph, solution, edgeId, node1, node2, color) {
    return _.first(Object.keys(solution)
      .filter(function(id) {
        return id === edgeId;
      })
      .map(_.partial(toTerm, solution))
      .map(toLabel)
      .map(function(term) {
        return _.extend(term, {
          color: color
        });
      })
      .map(function(term) {
        return graph.newEdge(node1, node2, term)
      }));
  },
  addEdgeToInstance = function(graph, solution, instanceNode) {
    var anchoredPgpNodeId = instanceNode.data.id.substr(1),
      edge_id = 's' + anchoredPgpNodeId,
      anchoredPgpNode = graph.nodeSet[anchoredPgpNodeId];
    addEdge(graph, solution, edge_id, anchoredPgpNode, instanceNode, '#999999');
  },
  addInstanceNode = function(graph, isFocus, solution) {
    var markIfFocus = _.partial(transformIf, _.compose(isFocus, function(term) {
      return term.id;
    }), toRed);

    return Object.keys(solution)
      .filter(instance.is)
      .map(_.partial(toTerm, solution))
      .map(toLabelAndSetFontNormal)
      .map(markIfFocus)
      .reduce(function(result, term) {
        var instanceNode = graph.newNode(term);
        addEdgeToInstance(graph, solution, instanceNode);
        result[term.id] = instanceNode;
        return result;
      }, {});
  },
  addTransitNode = function(graph, solution) {
    return Object.keys(solution)
      .filter(function(id) {
        return id[0] === 'x';
      })
      .map(_.partial(toTerm, solution))
      .map(toLabelAndSetFontNormal)
      .reduce(function(result, term) {
        result[term.id] = graph.newNode(term);
        return result;
      }, {});
  },
  toPathInfo = function(pathId) {
    return {
      id: pathId,
      no: pathId[1],
      childNo: parseInt(pathId[2])
    }
  },
  toLeftId = function(edge, pathInfo) {
    var anchoredPgpNodeId = edge.subject,
      instanceNodeId = 'i' + anchoredPgpNodeId;

    return {
      transitNodeId: 'x' + pathInfo.no + (pathInfo.childNo - 1),
      instanceNodeId: 'i' + anchoredPgpNodeId,
      anchoredPgpNodeId: anchoredPgpNodeId
    };
  },
  toRightId = function(edge, pathInfo) {
    var anchoredPgpNodeId = edge.object,
      instanceNodeId = 'i' + anchoredPgpNodeId;

    return {
      transitNodeId: 'x' + pathInfo.no + pathInfo.childNo,
      instanceNodeId: 'i' + anchoredPgpNodeId,
      anchoredPgpNodeId: anchoredPgpNodeId
    };
  },
  toGraphId = function(transitNodes, instanceNodes, canididateIds) {
    if (transitNodes[canididateIds.transitNodeId]) {
      return transitNodes[canididateIds.transitNodeId].id;
    } else if (instanceNodes[canididateIds.instanceNodeId]) {
      return instanceNodes[canididateIds.instanceNodeId].id
    } else {
      return canididateIds.anchoredPgpNodeId;
    }
  },
  toPath = function(graph, edges, transitNodes, instanceNodes, pathInfo) {
    var edge = edges[pathInfo.no],
      toGraphIdFromNodes = _.partial(toGraphId, transitNodes, instanceNodes),
      toGraphNode = _.compose(function(id) {
        return graph.nodeSet[id];
      }, toGraphIdFromNodes);

    return {
      id: pathInfo.id,
      left: toGraphNode(toLeftId(edge, pathInfo)),
      right: toGraphNode(toRightId(edge, pathInfo))
    };
  },
  addPath = function(graph, solution, edges, transitNodes, instanceNodes) {
    return Object.keys(solution)
      .filter(function(id) {
        return id[0] === 'p';
      })
      .map(toPathInfo)
      .map(_.partial(toPath, graph, edges, transitNodes, instanceNodes))
      .reduce(function(result, path) {
        result[path.id] = addEdge(graph, solution, path.id, path.left, path.right, '#2B5CFF');
        return result;
      }, {});
  };

module.exports = function(domId, options) {
  var graph = new Graph(domId, options);

  return {
    graph: graph,
    addAnchoredPgpNodes: _.partial(addAnchoredPgpNodes, graph),
    addInstanceNode: _.partial(addInstanceNode, graph),
    addTransitNode: _.partial(addTransitNode, graph),
    addPath: _.partial(addPath, graph)
  };
};