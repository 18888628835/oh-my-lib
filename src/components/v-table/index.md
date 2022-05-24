# VTable 虚拟列表

## 强得很

```tsx
import React, { useState } from 'react';
import { VTable } from 'oh-my-lib';
const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '住址',
    dataIndex: 'address',
    key: 'address',
  },
];
const data: any[] = [];
const setDataItem = (index: number) => ({
  name: `姓名：第${index}行`,
  age: `年龄：第${index}行`,
  address: `家庭住址：第${index}行`,
});
for (let i = 0; i < 10000; i++) {
  data.push(setDataItem(i));
}
export default () => {
  return (
    <div style={{ height: '500px', maxWidth: '800px' }}>
      <VTable dataSource={data} columns={columns} />
    </div>
  );
};
```

## 自定义 render

```tsx
import React, { useState } from 'react';
import { VTable } from 'oh-my-lib';
const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '住址',
    dataIndex: 'address',
    key: 'address',
    render: text => <div style={{ color: 'red' }}>{text}</div>,
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    render: (text, record, index) => [
      <a
        key="detail"
        style={{ marginRight: '20px' }}
        onClick={() => alert('行数据为' + JSON.stringify(record))}
      >
        详情
      </a>,
      <a key="delete" onClick={() => alert('index 为' + index)}>
        删除
      </a>,
    ],
  },
];
const data: any[] = [];
const setDataItem = (index: number) => ({
  name: `姓名：第${index}行`,
  age: `年龄：第${index}行`,
  address: `家庭住址：第${index}行`,
});
for (let i = 0; i < 2000; i++) {
  data.push(setDataItem(i));
}
export default () => {
  return (
    <div style={{ height: '500px', maxWidth: '800px' }}>
      <VTable dataSource={data} columns={columns} />
    </div>
  );
};
```

## 自定义行数

```tsx
import React, { useState } from 'react';
import { VTable } from 'oh-my-lib';
const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '住址',
    dataIndex: 'address',
    key: 'address',
    render: text => <div>{text}</div>,
  },
];
const data: any[] = [];
const setDataItem = (index: number) => ({
  name: `姓名：第${index}行`,
  age: `年龄：第${index}行`,
  address: `家庭住址：第${index}行`,
});
for (let i = 0; i < 2000; i++) {
  data.push(setDataItem(i));
}
export default () => {
  return (
    <div style={{ height: '500px', maxWidth: '800px' }}>
      <VTable dataSource={data} columns={columns} rowCount={20} />
    </div>
  );
};
```

## 自定义 width 和 textAlign

```tsx
import React, { useState } from 'react';
import { VTable } from 'oh-my-lib';
const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    headerTextAlign: 'center',
    contentTextAlign: 'center',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
    width: '200px',
    headerTextAlign: 'center',
    contentTextAlign: 'center',
  },
  {
    title: '住址',
    dataIndex: 'address',
    key: 'address',
    headerTextAlign: 'center',
    contentTextAlign: 'center',
    render: text => <div>{text}</div>,
  },
];
const data: any[] = [];
const setDataItem = (index: number) => ({
  name: `姓名：第${index}行`,
  age: `年龄：第${index}行`,
  address: `家庭住址：第${index}行`,
});
for (let i = 0; i < 2000; i++) {
  data.push(setDataItem(i));
}
export default () => {
  return (
    <div style={{ height: '500px', maxWidth: '800px' }}>
      <VTable dataSource={data} columns={columns} />
    </div>
  );
};
```

<API src='./v-table.tsx'>
