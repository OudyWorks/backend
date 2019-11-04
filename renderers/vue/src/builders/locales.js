import escodegen from 'escodegen'

export default function (locales) {
    return escodegen.generate({
        type: "Program",
        body: [{
                type: "VariableDeclaration",
                declarations: [{
                    type: "VariableDeclarator",
                    id: {
                        type: "Identifier",
                        name: "flattenizer"
                    },
                    init: {
                        type: "CallExpression",
                        callee: {
                            type: "Identifier",
                            name: "require"
                        },
                        arguments: [{
                            type: "Literal",
                            value: require.resolve('flattenizer'),
                        }]
                    }
                }],
                kind: "const"
            },
            {
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
                        type: "ObjectExpression",
                        properties: locales.map(
                            ({
                                file,
                                component,
                                task,
                                language
                            }) => ({
                                type: "Property",
                                method: false,
                                shorthand: false,
                                computed: false,
                                key: {
                                    type: "Literal",
                                    value: [language, component, task].filter(k => k).join('.'),
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
                            })
                        )
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
                            type: "CallExpression",
                            callee: {
                                type: "MemberExpression",
                                object: {
                                    type: "Identifier",
                                    name: "Object"
                                },
                                property: {
                                    type: "Identifier",
                                    name: "keys"
                                },
                                computed: false
                            },
                            arguments: [{
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
                            }]
                        },
                        property: {
                            type: "Identifier",
                            name: "forEach"
                        },
                        computed: false
                    },
                    arguments: [{
                        type: "FunctionExpression",
                        id: null,
                        expression: false,
                        generator: false,
                        async: false,
                        params: [{
                            type: "Identifier",
                            name: "key"
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
                                        property: {
                                            type: "Identifier",
                                            name: "key"
                                        },
                                        computed: true
                                    },
                                    right: {
                                        type: "ConditionalExpression",
                                        test: {
                                            type: "MemberExpression",
                                            object: {
                                                type: "MemberExpression",
                                                object: {
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
                                                property: {
                                                    type: "Identifier",
                                                    name: "key"
                                                },
                                                computed: true
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
                                                type: "MemberExpression",
                                                object: {
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
                                                property: {
                                                    type: "Identifier",
                                                    name: "key"
                                                },
                                                computed: true
                                            },
                                            property: {
                                                type: "Identifier",
                                                name: "default"
                                            },
                                            computed: false
                                        },
                                        alternate: {
                                            type: "MemberExpression",
                                            object: {
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
                                            property: {
                                                type: "Identifier",
                                                name: "key"
                                            },
                                            computed: true
                                        }
                                    }
                                }
                            }]
                        }
                    }]
                }
            },
            {
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
                                type: "Identifier",
                                name: "flattenizer"
                            },
                            property: {
                                type: "Identifier",
                                name: "unflatten"
                            },
                            computed: false
                        },
                        arguments: [{
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
                        }]
                    }
                }
            }
        ],
        sourceType: "module"
    })
}