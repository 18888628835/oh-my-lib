import React, { useState, useRef, useEffect, useMemo } from 'react';

import { Wrap } from './style';

export type RecordType = { [key: string]: any };

export type ColumnsProps = {
  /**
   * @description 映射字段
   */
  dataIndex: React.Key;
  /**
   * @description 字段名
   */
  title: string | React.ReactNode;
  /**
   * @description 自定义render
   */
  render?: (
    text: any,
    record: RecordType,
    rowIndex?: number,
  ) => React.ReactNode;
  /**
   * @description React的key
   */
  key?: string | number;
  /**
   * @description 宽度
   */
  width?: string | number;
  /**
   * @description 表头文字排版
   */
  headerTextAlign?: 'start' | 'end' | 'center';
  /**
   * @description 内容文字排版
   */
  contentTextAlign?: 'start' | 'end' | 'center';
};

interface VTableProps {
  /**
   * @description 展示的行数
   * @default 10
   */
  rowCount: number;
  /**
   * @description 表格标题
   */
  columns: Array<ColumnsProps>;
  /**
   * @description 表格数据
   */
  dataSource: Array<RecordType>;
  /**
   * @description 每行的key
   */
  rowKey?: string;
}

const defaultConfig = {
  rowCount: 10,
  rowHeight: 10,
  textAlign: 'start',
};
function setColStyle(width, textAlign, style?) {
  return {
    width: typeof width === 'number' ? width + 'px' : width,
    flex: width ? undefined : 1,
    textAlign: textAlign || defaultConfig.textAlign,
  };
}

const VTable: React.FC<VTableProps> = props => {
  const {
    rowCount = defaultConfig.rowCount,
    dataSource,
    columns,
    rowKey,
  } = props;
  /* 行数据的高度 */
  const [rowHeight, setRowHeight] = useState(rowCount);
  // 总高度= 每行行高*数据的长度
  const H = useMemo(() => dataSource.length * rowHeight, [
    dataSource,
    rowHeight,
  ]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(rowCount);

  function renderHeader(columns) {
    return columns.map(({ title, key, width, headerTextAlign }, index) => (
      <div
        className="fancy_table_cell"
        key={key || index}
        style={setColStyle(width, headerTextAlign)}
      >
        {title}
      </div>
    ));
  }

  function renderRowItem(
    record: RecordType,
    rowStyle: React.CSSProperties,
    rowIndex: number,
  ) {
    return (
      <div
        style={rowStyle}
        key={rowKey || rowIndex}
        className="fancy_v_table_row"
      >
        {columns.map(({ key, dataIndex, width, render, contentTextAlign }) => (
          <div
            className="fancy_table_cell"
            key={key || dataIndex}
            style={setColStyle(width, contentTextAlign)}
          >
            {render
              ? render(record[dataIndex], record, rowIndex)
              : record[dataIndex]}
          </div>
        ))}
      </div>
    );
  }

  function renderData() {
    const renderList: any[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      renderList.push(
        renderRowItem(
          dataSource[i],
          {
            height: rowHeight + 'px',
            top: i * rowHeight,
          },
          i,
        ),
      );
    }
    return renderList;
  }
  // 获得最外层盒子的引用
  const ref = useRef<HTMLDivElement>(null);

  const onScroll = function(e: React.UIEvent<HTMLDivElement, UIEvent>) {
    e.stopPropagation();
    if (ref.current === e.target) {
      let _startIndex = Math.floor(ref.current.scrollTop / rowHeight);
      let _endIndex = _startIndex + rowCount;
      /* 缓冲区尺寸，用来填补滚动时的空白，本质上就是多加一点数据 */
      const bufferSize = rowCount;
      // 添加缓冲区，以防滚动空白
      setStartIndex(Math.max(_startIndex - bufferSize, 0));
      setEndIndex(Math.min(_endIndex + bufferSize, dataSource.length));
    }
  };

  useEffect(() => {
    /* 每行行高=最外层盒子的可视高度/行数 */
    const _rowHeight = ref.current?.getBoundingClientRect()?.height! / rowCount;
    _rowHeight && setRowHeight(_rowHeight);
  }, []);

  return (
    <Wrap className="fancy_v_table_wrapper">
      <div className="thead">{renderHeader(columns)}</div>

      <div className="fancy_v_table_content" ref={ref} onScroll={onScroll}>
        <div className="container" style={{ height: H + 'px' }}>
          {renderData()}
        </div>
      </div>
    </Wrap>
  );
};

export default VTable;
