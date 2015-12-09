import OmniMock from '../src/omni-mock';

let vfs = new OmniMock((f, d, s) => {
  return d({
    'dir': d({
      'file.txt': f('content'),
      'nested': d({
        'paths': d({
          'also': d({
            'work': d()
          })
        })
      })
    })
  });
});

vfs.readdir('/').then(console.log);
vfs.statType('/').then(console.log);

let walker = vfs.walk('/');
walker.on('directory', console.log);
walker.on('file', console.log);
