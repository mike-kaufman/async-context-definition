(function instrumentConfig() {
    var callbackConfig = {
        __builtIn__: {
            /*Promise: {
                __configType__: 'function-package',
                __new__: true,
                __returnVal__: {
                    __configType__: 'package',
                    then: {
                        callbackArgIdx: [0]
                    },
                    catch: {
                        callbackArgIdx: [0]
                    }
                },
                prototype: {
                    __configType__: 'package',
                    then: {
                        callbackArgIdx: [0]
                    },
                    catch: {
                        callbackArgIdx: [0]
                    }
                },
                all: {
                    __returnVal__: {
                        __configType__: 'package',
                        then: {
                            callbackArgIdx: [0]
                        },
                        catch: {
                            callbackArgIdx: [0]
                        }
                    }
                }
            },*/
            setTimeout: {
                callbackArgIdx: [0]
            },
            setInterval: {
                callbackArgIdx: [0]
            },
            setImmediate: {
                callbackArgIdx: [0]
            },
            clearTimeout: {
                __clearCallback__: true
            },
            clearInterval: {
                __clearCallback__: true
            },
            clearImmediate: {
                __clearCallback__: true
            }
        },
        zlib: {
            deflate: {
                callbackArgIdx: [1, 2]
            },
            deflateRaw: {
                callbackArgIdx: [1, 2]
            },
            gunzip: {
                callbackArgIdx: [1, 2]
            },
            gzip: {
                callbackArgIdx: [1, 2]
            },
            inflate: {
                callbackArgIdx: [1, 2]
            },
            inflateRaw: {
                callbackArgIdx: [1, 2]
            },
            unzip: {
                callbackArgIdx: [1, 2]
            },
            createGzip: {
                __returnVal__: {
                    __configType__: 'package',
                    flush: {
                        callbackArgIdx: [0, 1]
                    },
                    params: {
                        callbackArgIdx: [2]
                    },
                    close: {
                        callbackArgIdx: [0]
                    },
                    write: {
                        callbackArgIdx: [1]
                    }
                }
            },
            createDeflate: {
                __returnVal__: {
                    __configType__: 'package',
                    flush: {
                        callbackArgIdx: [0, 1]
                    },
                    params: {
                        callbackArgIdx: [2]
                    },
                    close: {
                        callbackArgIdx: [0]
                    },
                    write: {
                        callbackArgIdx: [1]
                    }
                }
            },
            createDeflateRaw: {
                __returnVal__: {
                    __configType__: 'package',
                    flush: {
                        callbackArgIdx: [0, 1]
                    },
                    params: {
                        callbackArgIdx: [2]
                    },
                    close: {
                        callbackArgIdx: [0]
                    },
                    write: {
                        callbackArgIdx: [1]
                    }
                }
            },
            createGunzip: {
                __returnVal__: {
                    __configType__: 'package',
                    flush: {
                        callbackArgIdx: [0, 1]
                    },
                    params: {
                        callbackArgIdx: [2]
                    },
                    close: {
                        callbackArgIdx: [0]
                    },
                    write: {
                        callbackArgIdx: [1]
                    }
                }
            },
            createInflate: {
                __returnVal__: {
                    __configType__: 'package',
                    flush: {
                        callbackArgIdx: [0, 1]
                    },
                    params: {
                        callbackArgIdx: [2]
                    },
                    close: {
                        callbackArgIdx: [0]
                    },
                    write: {
                        callbackArgIdx: [1]
                    }
                }
            },
            createInflateRaw: {
                __returnVal__: {
                    __configType__: 'package',
                    flush: {
                        callbackArgIdx: [0, 1]
                    },
                    params: {
                        callbackArgIdx: [2]
                    },
                    close: {
                        callbackArgIdx: [0]
                    },
                    write: {
                        callbackArgIdx: [1]
                    }
                }
            },
            createUnzip: {
                __returnVal__: {
                    __configType__: 'package',
                    flush: {
                        callbackArgIdx: [0, 1]
                    },
                    params: {
                        callbackArgIdx: [2]
                    },
                    close: {
                        callbackArgIdx: [0]
                    },
                    write: {
                        callbackArgIdx: [1]
                    }
                }
            }
        },
        dgram: {
            createSocket: {
                callbackArgIdx: [1],
                __returnVal__: {
                    __configType__: 'package',
                    bind: {
                        callbackArgIdx: [0, 1, 2]
                    },
                    close: {
                        callbackArgIdx: [0]
                    },
                    send: {
                        callbackArgIdx: [3, 4]
                    },
                    setTimeout: {
                        callbackArgIdx: [1]
                    },
                    write: {
                        callbackArgIdx: [1]
                    },
                    listen: {
                        callbackArgIdx: [1]
                    },
                    connect: {
                        callbackArgIdx: [1]
                    }
                }
            }
        },
        tls: {
            connect: {
                callbackArgIdx: [1, 2, 3],
                __returnVal__: {
                    __configType__: 'package'
                }
            }
        },
        cluster: {
            fork: {
                __returnVal__: {
                    __configType__: 'package',
                    _getServer: {
                        callbackArgIdx: [2]
                    },
                    send: {
                        callbackArgIdx: [1, 2]
                    }
                }
            },
            _getServer: {
                callbackArgIdx: [2]
            },
            disconnect: {
                callbackArgIdx: [0]
            }
        },
        readline: {
            createInterface: {
                __returnVal__: {
                    __configType__: 'package',
                    question: {
                        callbackArgIdx: [1]
                    }
                }
            }
        },
        events: {
            __configType__: 'package',
            __returnVal__: {},
            prototype: {
                __configType__: 'package',
                on: {
                    callbackArgIdx: [1]
                },
                prependListener: {
                    callbackArgIdx: [1]
                }
            }
        },

        domain: {
            bind: {
                callbackArgIdx: [0]
            },
            intercept: {
                callbackArgIdx: [0]
            }
        },
        dns: {
            lookup: {
                callbackArgIdx: [1]
            },
            lookupService: {
                callbackArgIdx: [2]
            },
            resolve: {
                callbackArgIdx: [1]
            },
            resolve4: {
                callbackArgIdx: [1]
            },
            resolve6: {
                callbackArgIdx: [1]
            },
            resolveCname: {
                callbackArgIdx: [1]
            },
            resolveMx: {
                callbackArgIdx: [1]
            },
            resolveNs: {
                callbackArgIdx: [1]
            },
            resolveSoa: {
                callbackArgIdx: [1]
            },
            resolveSrv: {
                callbackArgIdx: [1]
            },
            resolvePtr: {
                callbackArgIdx: [1]
            },
            resolveTxt: {
                callbackArgIdx: [1]
            },
            reverse: {
                callbackArgIdx: [1]
            }
        },
        fs: {
            createWriteStream: {
                __returnVal__: {
                    __configType__: 'package',
                    end: {
                        callbackArgIdx: [0, 1, 2]
                    },
                    write: {
                        callbackArgIdx: [1, 2]
                    }
                }
            },
            open: {
                callbackArgIdx: [2]
            },
            close: {
                callbackArgIdx: [1]
            },
            rename: {
                callbackArgIdx: [2]
            },
            stat: {
                callbackArgIdx: [1]
            },
            access: {
                callbackArgIdx: [1]
            },
            appendFile: {
                callbackArgIdx: [2]
            },
            chmod: {
                callbackArgIdx: [2]
            },
            chown: {
                callbackArgIdx: [3]
            },
            exists: {
                callbackArgIdx: [1]
            },
            fchmod: {
                callbackArgIdx: [2]
            },
            fchown: {
                callbackArgIdx: [3]
            },
            fdatasync: {
                callbackArgIdx: [1]
            },
            fstat: {
                callbackArgIdx: [1]
            },
            fsync: {
                callbackArgIdx: [1]
            },
            ftruncate: {
                callbackArgIdx: [2]
            },
            futimes: {
                callbackArgIdx: [3]
            },
            lchmod: {
                callbackArgIdx: [2]
            },
            lchown: {
                callbackArgIdx: [3]
            },
            link: {
                callbackArgIdx: [2]
            },
            lstat: {
                callbackArgIdx: [1]
            },
            mkdir: {
                callbackArgIdx: [1]
            },
            mkdtemp: {
                callbackArgIdx: [1]
            },
            read: {
                callbackArgIdx: [5]
            },
            readdir: {
                callbackArgIdx: [1]
            },
            readFile: {
                callbackArgIdx: [1]
            },
            readLink: {
                callbackArgIdx: [1]
            },
            realpath: {
                callbackArgIdx: [1]
            },
            rmdir: {
                callbackArgIdx: [1]
            },
            symlink: {
                callbackArgIdx: [2]
            },
            truncate: {
                callbackArgIdx: [2]
            },
            unlink: {
                callbackArgIdx: [1]
            },
            utimes: {
                callbackArgIdx: [3]
            },
            write: {
                callbackArgIdx: [4]
            },
            writeFile: {
                callbackArgIdx: [2, 3]
            },
            watch: {
                callbackArgIdx: [1]
            },
            unwatchFile: {
                callbackArgIdx: [1]
            },
            watchFile: {
                callbackArgIdx: [1]
            }
        },
        process: {
            nextTick: {
                callbackArgIdx: [0]
            },
            send: {
                callbackArgIdx: [1, 2, 3]
            }
        },
        crypto: {
            pbkdf2: {
                callbackArgIdx: [5]
            },
            randomBytes: {
                callbackArgIdx: [1]
            }
        },
        // eslint-disable-next-line camelcase
        child_process: {
            exec: {
                callbackArgIdx: [1]
            },
            execFile: {
                callbackArgIdx: [2]
            }
        },
        https: {
            request: {
                callbackArgIdx: [1],
                __returnVal__: { // returns http.ClientRequest
                    __configType__: 'package',
                    end: {
                        callbackArgIdx: [0, 1, 2]
                    },
                    setTimeout: {
                        callbackArgIdx: [1]
                    },
                    write: {
                        callbackArgIdx: [1, 2]
                    }
                }
            },
            createServer: {
                callbackArgIdx: [0],
                __returnVal__: {
                    __configType__: 'package',
                    listen: {
                        callbackArgIdx: [1]
                    },
                    /*close: {
                        callbackArgIdx: [0]
                    },*/
                    setTimeout: {
                        callbackArgIdx: [1]
                    },
                    getConnections: {
                        callbackArgIdx: [0]
                    }
                }
            },
            get: {
                callbackArgIdx: [1],
                __returnVal__: {
                    __configType__: 'package',
                    listen: {
                        callbackArgIdx: [2]
                    },
                    end: {
                        callbackArgIdx: [0, 1, 2]
                    },
                    setTimeout: {
                        callbackArgIdx: [1]
                    },
                    write: {
                        callbackArgIdx: [1, 2]
                    }
                }
            }
        },
        // eslint-disable-next-line camelcase
        _http_client: {
            __configType__: 'package',
            __returnVal__: {},
            ClientRequest: {
                __configType__: 'package',
                __returnVal__: {},
                prototype: {
                    __configType__: 'package',
                    setTimeout: {
                        callbackArgIdx: [1]
                    }
                }
            }
        },
        // eslint-disable-next-line camelcase
        _http_outgoing: {
            __configType__: 'package',
            __returnVal__: {},
            OutgoingMessage: {
                __configType__: 'package',
                __returnVal__: {},
                prototype: {
                    __configType__: 'package',
                    __returnVal__: {},
                    end: {
                        callbackArgIdx: [0, 1, 2]
                    },
                    /*setTimeout: {
                        callbackArgIdx: [1]
                    },*/
                    write: {
                        callbackArgIdx: [1, 2]
                    }
                }
            }
        },
        http: {
            request: {
                callbackArgIdx: [1],
                __returnVal__: { // returns http.ClientRequest
                    /*
                    __configType__: 'package',
                    end: {
                        callbackArgIdx: [0, 1, 2]
                    },
                    setTimeout: {
                        callbackArgIdx: [1]
                    },
                    write: {
                        callbackArgIdx: [1, 2]
                    }*/
                }
            },
            createServer: {
                callbackArgIdx: [0],
                __returnVal__: {
                    __configType__: 'package',
                    listen: {
                        callbackArgIdx: [1]
                    },
                    /*close: {
                        callbackArgIdx: [0]
                    },*/
                    setTimeout: {
                        callbackArgIdx: [1]
                    },
                    getConnections: {
                        callbackArgIdx: [0]
                    }
                }
            },
            createConnection: {
                callbackArgIdx: [1],
                __returnVal__: {
                    __configType__: 'package',
                    setTimeout: {
                        callbackArgIdx: [1]
                    },
                    write: {
                        callbackArgIdx: [1]
                    },
                    listen: {
                        callbackArgIdx: [1]
                    },
                    connect: {
                        callbackArgIdx: [1]
                    }
                }
            },
            get: {
                callbackArgIdx: [1]/*,
                __returnVal__: { // returns http.ClientRequest
                    __configType__: 'package',
                    listen: {
                        callbackArgIdx: [2]
                    },
                    end: {
                        callbackArgIdx: [0, 1, 2]
                    },
                    setTimeout: {
                        callbackArgIdx: [1]
                    },
                    write: {
                        callbackArgIdx: [1, 2]
                    }
                }*/
            }
        },
        net: {
            connect: {
                callbackArgIdx: [2],
                __returnVal__: {
                    __configType__: 'package',
                    setTimeout: {
                        callbackArgIdx: [1]
                    },
                    write: {
                        callbackArgIdx: [1]
                    },
                    listen: {
                        callbackArgIdx: [1]
                    },
                    connect: {
                        callbackArgIdx: [1]
                    },
                    _handle: {
                        __configType__: 'package',
                        onread: {
                            __configType__: 'cb_type'
                        },
                        oncomplete: {
                            __configType__: 'cb_type'
                        }
                    }
                }
            },
            createConnection: {
                callbackArgIdx: [1],
                __returnVal__: {
                    __configType__: 'package',
                    setTimeout: {
                        callbackArgIdx: [1]
                    },
                    /*write: {
                        callbackArgIdx: [1]
                    },*/
                    listen: {
                        callbackArgIdx: [1]
                    },
                    connect: {
                        callbackArgIdx: [1]
                    },
                    _handle: {
                        __configType__: 'package',
                        onread: {
                            __configType__: 'cb_type'
                        }/*,
                        oncomplete: {
                            __configType__: 'cb_type'
                        },*/
                    }
                }
            },
            createServer: {
                callbackArgIdx: [0],
                __parameter__: {
                    0: {
                        __configType__: 'package',
                        setTimeout: {
                            callbackArgIdx: [1]
                        },
                        write: {
                            callbackArgIdx: [1]
                        },
                        listen: {
                            callbackArgIdx: [1]
                        },
                        connect: {
                            callbackArgIdx: [1]
                        }
                    }
                },
                __returnVal__: {
                    __configType__: 'package',
                    listen: {
                        callbackArgIdx: [1]
                    },
                    getConnections: {
                        callbackArgIdx: [0]
                    },
                    /*close: {
                        callbackArgIdx: [0]
                    },*/
                    write: {
                        callbackArgIdx: [1]
                    }
                }
            },
            Server: {
                __configType__: 'package',
                prototype: {
                    __configType__: 'package',
                    close: {
                        callbackArgIdx: [0]
                    }
                }

            }
        }
    };

    module.exports.cbconfig = callbackConfig;
})();
