/**
 * 基础API枚举
 */
enum BaseApi {
  /**
   * 全部
   */
  ALL = 'all',
  /**
   * 获取单条数据
   */
  FETCH_ONE = 'fetchOne',
  /**
   * 获取列表数据
   */
  FETCH_LIST = 'fetchList',
  /**
   * 分页获取数据
   */
  FETCH_PAGE = 'fetchPage',
  /**
   * 新增数据
   */
  CREATE = 'create',
  /**
   * 批量新增数据
   */
  CREATE_BATCH = 'createBatch',
  /**
   * 修改数据
   */
  MODIFY = 'modify',
  /**
   * 批量修改数据
   */
  MODIFY_BATCH = 'modifyBatch',
  /**
   * 删除数据
   */
  DELETE = 'delete',
  /**
   * 批量删除数据
   */
  DELETE_BATCH = 'deleteBatch',
}

export default BaseApi;
