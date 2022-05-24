import styled from 'styled-components';

export const THead = `
  min-height: 54px;
  font-weight: 500;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.03)),
    #ffffff;
  box-shadow: inset 0px -1px 0px rgba(0, 0, 0, 0.08);
`;

const scrollWidth = '8px';

export const Wrap = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;

  .thead {
    ${THead}
    display: flex;
    align-items: center;
  }
  .fancy_v_table_content {
    height: 100%;
    overflow-y: hidden;
    padding-right: ${scrollWidth};
    :hover {
      padding-right: 0;
      overflow-y: auto;
    }
    ::-webkit-scrollbar {
      width: ${scrollWidth};
    }

    ::-webkit-scrollbar-track {
      background-color: #e4e4e4;
      border-radius: ${scrollWidth};
    }

    ::-webkit-scrollbar-thumb {
      background-color: #d4aa70;
      border-radius: ${scrollWidth};
    }
    .container {
      position: relative;
    }
  }
  .fancy_v_table_row {
    display: flex;
    align-items: center;
    position: absolute;
    left: 0;
    right: 0;
    border-bottom: 1px solid var(--default-bd-color);
  }
  .fancy_table_cell {
    padding-left: 8px;
    padding-right: 8px;
  }
`;
