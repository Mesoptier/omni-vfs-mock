import { posix as pp } from 'path';
import { Promise } from 'bluebird';

import { OmniBase, Stats } from 'omni-vfs';
import { tree as omniTree } from 'omni-tree';

export default class OmniMock extends OmniBase {

  constructor(tree) {
    super();

    // TODO: Replace with `typeof` check when Babel fixes issue #T6644
    if (tree instanceof Function) {
      tree = omniTree(tree).map((path, name, node) => {
        node.stats = new Stats({
          type: node.type,
          mime: Stats.lookupMimeType(name)
        });
        return node;
      }).tree;
    }

    this._tree = tree;
  }

  readdir(path) {
    let node = this._resolve(this._tree, path);
    if (node.type !== 'directory')
      throw new Error(`ENOTDIR: Not a directory "${path}"`);
    return Promise.resolve(Object.keys(node.items));
  }

  statType(path) {
    let node = this._resolve(this._tree, path);
    return Promise.resolve(node.type);
  }

  stat(path) {
    let node = this._resolve(this._tree, path);
    return Promise.resolve(node.stats);
  }

  _resolve(node, path) {
    path = pp.resolve(path);
    path = path.split(pp.sep).filter((item) => item.length > 0);

    let fullPath = '';

    node = path.reduce((node, part, i, path) => {
      fullPath += pp.sep + part;
      node = node.items[part];

      if (node === undefined)
        throw new Error(`ENOENT: No such file or directory "${fullPath}"`);

      if (node.type !== 'directory' && (path.length - 1 !== i))
        throw new Error(`ENOTDIR: Not a directory "${fullPath}"`);

      return node;
    }, node);

    return node;
  }

}
