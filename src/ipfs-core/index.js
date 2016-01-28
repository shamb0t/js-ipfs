'use strict'

const defaultRepo = require('./default-repo')
// const bl = require('bl')
const mDAG = require('ipfs-merkle-dag')
const BlockService = mDAG.BlockService
const Block = mDAG.Block

exports = module.exports = IPFS

function IPFS (repo) {
  if (!(this instanceof IPFS)) {
    throw new Error('Must be instantiated with new')
  }

  if (!repo) {
    repo = defaultRepo()
  }
  const bs = new BlockService(repo)

  this.daemon = callback => {
    // 1. read repo to get peer data
  }

  this.version = (opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    repo.exists((err, exists) => {
      if (err) { return callback(err) }

      repo.config.get((err, config) => {
        if (err) { return callback(err) }

        callback(null, config.Version.Current)
      })
    })
  }

  this.id = (opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    repo.exists((err, exists) => {
      if (err) { return callback(err) }

      repo.config.get((err, config) => {
        if (err) {
          return callback(err)
        }
        callback(null, {
          ID: config.Identity.PeerID,
          // TODO needs https://github.com/diasdavid/js-peer-id/blob/master/src/index.js#L76
          PublicKey: '',
          Addresses: config.Addresses,
          AgentVersion: 'js-ipfs',
          ProtocolVersion: '9000'
        })
      })
    })
  }

  this.repo = {
    init: (bits, force, empty, callback) => {
      // 1. check if repo already exists
    },

    version: (opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }
      repo.exists((err, res) => {
        if (err) { return callback(err) }
        repo.version.read(callback)
      })
    },

    gc: function () {}
  }

  this.bootstrap = {
    list: (callback) => {
      repo.config.get((err, config) => {
        if (err) { return callback(err) }
        callback(null, config.Bootstrap)
      })
    },
    add: (multiaddr, callback) => {
      repo.config.get((err, config) => {
        if (err) { return callback(err) }
        config.Bootstrap.push(multiaddr)
        repo.config.set(config, err => {
          if (err) { return callback(err) }

          callback()
        })
      })
    },
    rm: (multiaddr, callback) => {
      repo.config.get((err, config) => {
        if (err) { return callback(err) }
        config.Bootstrap = config.Bootstrap.filter(mh => {
          if (mh === multiaddr) {
            return false
          } else { return true }
        })
        repo.config.set(config, err => {
          if (err) { return callback(err) }
          callback()
        })
      })
    }
  }

  this.config = {
    // cli only feature built with show and replace
    // edit: (callback) => {},
    replace: (config, callback) => {
      repo.config.set(config, callback)
    },
    show: callback => {
      repo.config.get((err, config) => {
        if (err) { return callback(err) }
        callback(null, config)
      })
    }
  }

  this.block = {
    get: (multihash, callback) => {
      bs.getBlock(multihash, callback)
    },
    put: (block, callback) => {
      bs.addBlock(block, callback)
    },
    del: (multihash, callback) => {
      bs.deleteBlock(multihash, callback)
    },
    stat: (multihash, callback) => {
      bs.getBlock(multihash, (err, block) => {
        if (err) {
          return callback(err)
        }
        callback(null, {
          Key: multihash,
          Size: block.data.length
        })
      })
    }
  }

  this.object = {
    // named `new` in go-ipfs
    create: (template, callback) => {
      if (!callback) {
        callback = template
      }
      var node = new mDAG.DAGNode()
      var block = new Block(node.marshal())
      bs.addBlock(block, function (err) {
        if (err) {
          return callback(err)
        }
        callback(null, {
          Hash: block.key,
          Size: node.size(),
          Name: ''
        })
      })
    },
    patch: (multihash, options, callback) => {},
    data: (multihash, callback) => {},
    links: (multihash, callback) => {},
    get: (multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
    },
    put: (multihash, options, callback) => {},
    stat: (multihash, options, callback) => {}
  }
}
