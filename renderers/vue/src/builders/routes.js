import escodegen from 'escodegen'

export default function (routes) {
    return escodegen.generate({
        type: "Program",
        body: [{
            type: "ExpressionStatement",
            expression: {
                type: "AssignmentExpression",
                operator: "=",
                left: {
                    type: "MemberExpression",
                    object: {
                        type: "Identifier",
                        name: "module"
                    },
                    property: {
                        type: "Identifier",
                        name: "exports"
                    },
                    computed: false
                },
                right: {
                    type: "CallExpression",
                    callee: {
                        type: "MemberExpression",
                        object: {
                            type: "CallExpression",
                            callee: {
                                type: "MemberExpression",
                                object: {
                                    type: "ArrayExpression",
                                    elements: routes.map(
                                        ({
                                            file,
                                            component,
                                            task
                                        }) => ({
                                            type: "ObjectExpression",
                                            properties: [{
                                                    type: "Property",
                                                    method: false,
                                                    shorthand: false,
                                                    computed: false,
                                                    key: {
                                                        type: "Identifier",
                                                        name: "module"
                                                    },
                                                    value: {
                                                        type: "CallExpression",
                                                        callee: {
                                                            type: "Identifier",
                                                            name: "require"
                                                        },
                                                        arguments: [{
                                                            type: "Literal",
                                                            value: file,
                                                        }]
                                                    },
                                                    kind: "init"
                                                },
                                                {
                                                    type: "Property",
                                                    method: false,
                                                    shorthand: false,
                                                    computed: false,
                                                    key: {
                                                        type: "Identifier",
                                                        name: "component"
                                                    },
                                                    value: {
                                                        type: "Literal",
                                                        value: component,
                                                    },
                                                    kind: "init"
                                                },
                                                {
                                                    type: "Property",
                                                    method: false,
                                                    shorthand: false,
                                                    computed: false,
                                                    key: {
                                                        type: "Identifier",
                                                        name: "task"
                                                    },
                                                    value: {
                                                        type: "Literal",
                                                        value: task,
                                                    },
                                                    kind: "init"
                                                }
                                            ]
                                        })
                                    )
                                },
                                property: {
                                    type: "Identifier",
                                    name: "map"
                                },
                                computed: false
                            },
                            arguments: [{
                                type: "ArrowFunctionExpression",
                                id: null,
                                expression: true,
                                generator: false,
                                async: false,
                                params: [{
                                    type: "ObjectPattern",
                                    properties: [{
                                            type: "Property",
                                            method: false,
                                            shorthand: true,
                                            computed: false,
                                            key: {
                                                type: "Identifier",
                                                name: "module"
                                            },
                                            kind: "init",
                                            value: {
                                                type: "Identifier",
                                                name: "module"
                                            }
                                        },
                                        {
                                            type: "Property",
                                            method: false,
                                            shorthand: true,
                                            computed: false,
                                            key: {
                                                type: "Identifier",
                                                name: "component"
                                            },
                                            kind: "init",
                                            value: {
                                                type: "Identifier",
                                                name: "component"
                                            }
                                        },
                                        {
                                            type: "Property",
                                            method: false,
                                            shorthand: true,
                                            computed: false,
                                            key: {
                                                type: "Identifier",
                                                name: "task"
                                            },
                                            kind: "init",
                                            value: {
                                                type: "Identifier",
                                                name: "task"
                                            }
                                        }
                                    ]
                                }],
                                body: {
                                    type: "ObjectExpression",
                                    properties: [{
                                            type: "Property",
                                            method: false,
                                            shorthand: false,
                                            computed: false,
                                            key: {
                                                type: "Identifier",
                                                name: "module"
                                            },
                                            value: {
                                                type: "ConditionalExpression",
                                                test: {
                                                    type: "MemberExpression",
                                                    object: {
                                                        type: "Identifier",
                                                        name: "module"
                                                    },
                                                    property: {
                                                        type: "Identifier",
                                                        name: "__esModule"
                                                    },
                                                    computed: false
                                                },
                                                consequent: {
                                                    type: "MemberExpression",
                                                    object: {
                                                        type: "Identifier",
                                                        name: "module"
                                                    },
                                                    property: {
                                                        type: "Identifier",
                                                        name: "default"
                                                    },
                                                    computed: false
                                                },
                                                alternate: {
                                                    type: "Identifier",
                                                    name: "module"
                                                }
                                            },
                                            kind: "init"
                                        },
                                        {
                                            type: "Property",
                                            method: false,
                                            shorthand: true,
                                            computed: false,
                                            key: {
                                                type: "Identifier",
                                                name: "component"
                                            },
                                            kind: "init",
                                            value: {
                                                type: "Identifier",
                                                name: "component"
                                            }
                                        },
                                        {
                                            type: "Property",
                                            method: false,
                                            shorthand: true,
                                            computed: false,
                                            key: {
                                                type: "Identifier",
                                                name: "task"
                                            },
                                            kind: "init",
                                            value: {
                                                type: "Identifier",
                                                name: "task"
                                            }
                                        }
                                    ]
                                }
                            }]
                        },
                        property: {
                            type: "Identifier",
                            name: "map"
                        },
                        computed: false
                    },
                    arguments: [{
                        type: "ArrowFunctionExpression",
                        id: null,
                        expression: false,
                        generator: false,
                        async: false,
                        params: [{
                            type: "ObjectPattern",
                            properties: [{
                                    type: "Property",
                                    method: false,
                                    shorthand: true,
                                    computed: false,
                                    key: {
                                        type: "Identifier",
                                        name: "module"
                                    },
                                    kind: "init",
                                    value: {
                                        type: "Identifier",
                                        name: "module"
                                    }
                                },
                                {
                                    type: "Property",
                                    method: false,
                                    shorthand: true,
                                    computed: false,
                                    key: {
                                        type: "Identifier",
                                        name: "component"
                                    },
                                    kind: "init",
                                    value: {
                                        type: "Identifier",
                                        name: "component"
                                    }
                                },
                                {
                                    type: "Property",
                                    method: false,
                                    shorthand: true,
                                    computed: false,
                                    key: {
                                        type: "Identifier",
                                        name: "task"
                                    },
                                    kind: "init",
                                    value: {
                                        type: "Identifier",
                                        name: "task"
                                    }
                                }
                            ]
                        }],
                        body: {
                            type: "BlockStatement",
                            body: [{
                                    type: "ExpressionStatement",
                                    expression: {
                                        type: "AssignmentExpression",
                                        operator: "=",
                                        left: {
                                            type: "MemberExpression",
                                            object: {
                                                type: "Identifier",
                                                name: "module"
                                            },
                                            property: {
                                                type: "Identifier",
                                                name: "name"
                                            },
                                            computed: false
                                        },
                                        right: {
                                            type: "AssignmentExpression",
                                            operator: "=",
                                            left: {
                                                type: "MemberExpression",
                                                object: {
                                                    type: "MemberExpression",
                                                    object: {
                                                        type: "Identifier",
                                                        name: "module"
                                                    },
                                                    property: {
                                                        type: "Identifier",
                                                        name: "component"
                                                    },
                                                    computed: false
                                                },
                                                property: {
                                                    type: "Identifier",
                                                    name: "name"
                                                },
                                                computed: false
                                            },
                                            right: {
                                                type: "CallExpression",
                                                callee: {
                                                    type: "MemberExpression",
                                                    object: {
                                                        type: "CallExpression",
                                                        callee: {
                                                            type: "MemberExpression",
                                                            object: {
                                                                type: "ArrayExpression",
                                                                elements: [{
                                                                        type: "Identifier",
                                                                        name: "component"
                                                                    },
                                                                    {
                                                                        type: "Identifier",
                                                                        name: "task"
                                                                    }
                                                                ]
                                                            },
                                                            property: {
                                                                type: "Identifier",
                                                                name: "filter"
                                                            },
                                                            computed: false
                                                        },
                                                        arguments: [{
                                                            type: "ArrowFunctionExpression",
                                                            id: null,
                                                            expression: true,
                                                            generator: false,
                                                            async: false,
                                                            params: [{
                                                                type: "Identifier",
                                                                name: "k"
                                                            }],
                                                            body: {
                                                                type: "Identifier",
                                                                name: "k"
                                                            }
                                                        }]
                                                    },
                                                    property: {
                                                        type: "Identifier",
                                                        name: "join"
                                                    },
                                                    computed: false
                                                },
                                                arguments: [{
                                                    type: "Literal",
                                                    value: "-",
                                                }]
                                            }
                                        }
                                    }
                                },
                                {
                                    type: "ExpressionStatement",
                                    expression: {
                                        type: "CallExpression",
                                        callee: {
                                            type: "MemberExpression",
                                            object: {
                                                type: "Identifier",
                                                name: "Object"
                                            },
                                            property: {
                                                type: "Identifier",
                                                name: "assign"
                                            },
                                            computed: false
                                        },
                                        arguments: [{
                                                type: "AssignmentExpression",
                                                operator: "=",
                                                left: {
                                                    type: "MemberExpression",
                                                    object: {
                                                        type: "Identifier",
                                                        name: "module"
                                                    },
                                                    property: {
                                                        type: "Identifier",
                                                        name: "meta"
                                                    },
                                                    computed: false
                                                },
                                                right: {
                                                    type: "LogicalExpression",
                                                    left: {
                                                        type: "MemberExpression",
                                                        object: {
                                                            type: "Identifier",
                                                            name: "module"
                                                        },
                                                        property: {
                                                            type: "Identifier",
                                                            name: "meta"
                                                        },
                                                        computed: false
                                                    },
                                                    operator: "||",
                                                    right: {
                                                        type: "ObjectExpression",
                                                        properties: []
                                                    }
                                                }
                                            },
                                            {
                                                type: "ObjectExpression",
                                                properties: [{
                                                        type: "Property",
                                                        method: false,
                                                        shorthand: true,
                                                        computed: false,
                                                        key: {
                                                            type: "Identifier",
                                                            name: "component"
                                                        },
                                                        kind: "init",
                                                        value: {
                                                            type: "Identifier",
                                                            name: "component"
                                                        }
                                                    },
                                                    {
                                                        type: "Property",
                                                        method: false,
                                                        shorthand: true,
                                                        computed: false,
                                                        key: {
                                                            type: "Identifier",
                                                            name: "task"
                                                        },
                                                        kind: "init",
                                                        value: {
                                                            type: "Identifier",
                                                            name: "task"
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                },
                                {
                                    type: "ReturnStatement",
                                    argument: {
                                        type: "Identifier",
                                        name: "module"
                                    }
                                }
                            ]
                        }
                    }]
                }
            }
        }],
        sourceType: "module"
    })
}