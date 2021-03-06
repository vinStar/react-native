import { observable, computed, action } from 'mobx';
import newGoods from './newGoods';
import categoryGoods from './categoryGoods';

/**
 * 根store
 */
class RootStore {
    constructor() {
        this.NewGoodsStore = new NewGoodsStore(newGoods, this);
        this.CartStore = new CartStore(this);
        this.OrderStore = new OrderStore(this);
        this.CategoryGoodsStore = new CategoryGoodsStore(categoryGoods, this);
    }
}

// 首页新品
class NewGoodsStore {
    @observable
    allDatas = {}

    constructor(data, rootStore) {
        this.allDatas = data;
        this.rootStore = rootStore;
    }
}

// 分类
class CategoryGoodsStore {
    @observable
    allDatas = [];

    constructor(data, rootStore) {
        this.allDatas = data;
        this.rootStore = rootStore;
    }
}

// 订单
class OrderStore {
    @observable
    allDatas = [];

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    /**
     * 添加订单
     * @param {[type]} order 订单数据，每个订单数据包含一个总价字段， 一个物品数组
     */
    @action
    addOrder(order) {
        if (order) {
            this.allDatas.push(order);
        }
    }
}

// 购物车
class CartStore {
    @observable
    allDatas = {}

    constructor(rootStore) {
        this.allDatas = {
            "data": [
            ],
            "isAllSelected" : true,
            "totalMoney" : 0
        };
        this.rootStore = rootStore;
    }

    /**
     * 添加购物车
     * item: 添加的商品
     * num: 添加数量
     * 
     */
    @action
    add(item, num) {
        let { data } = this.allDatas;
        let index = -1;

        data.forEach((v, i) => {
            if (item.name === v.name) {
                index = i;
            }
        });

        if (index !== -1) {
            data[index].count +=num;
        } else {
            data.push({
                ...item,
                ...{count: num},
            });
        }

        // 生成新的对象 否则页面不会刷新
        this.allDatas.data = [...data];
        this.allDatas.isAllSelected = data.every((v) => v.isSelected);
    }

    /**
     * 删除条目
     * @param 条目
     */
    deleteCart(item) {
        this.allDatas.data = this.allDatas.data.filter((v) => {
            return item.name !== v.name ;
        });
    }

    /**
     * 是否全选设置
     * @param  {Boolean} isSelectAll 是否全选
     * @return {[type]}
     */
    @action
    setSelectAll(isSelectAll) {
        if (typeof isSelectAll !== 'boolean') {
            return;
        }
        const { data } = this.allDatas;
        this.allDatas.isAllSelected = isSelectAll;
        this.allDatas.data = this.allDatas.data.map((v) => {
            v.isSelected = isSelectAll;
            return v;
        });
        // 下面的代码不会引起更新， 看来对于多级的对象， 还是要返回一个新的对象才行
        // this.allDatas.data.forEach((v, i) => {
        //     v.isSelected = isSelectAll;
        // })
    }

    /**
     * 清空已支付的购物车
     * @return {[type]}
     */
    @action
    deleteHasPaid() {
        const { data } = this.allDatas;
        this.allDatas.data = data.filter((v) => {
            return !v.isSelected;
        });
        if (this.allDatas.data.length === 0) {
            this.allDatas.isAllSelected = false;
        }
    }

    /**
     * 切换购物车条目是否选中
     * @param  单条数据
     */
    toggleSelect(item) {
        const { data } = this.allDatas;
        let isAllSelected = true;
        // 返回一个新对象
        this.allDatas.data = this.allDatas.data.map((v, i) => {
            if (v.name === item.name) {
                v.isSelected = !v.isSelected;
            }
            if (!v.isSelected) {
                isAllSelected = false;
            }
            return v;
        });
        this.allDatas.isAllSelected = isAllSelected;
    }

    @computed get totalMoney() {
        let money = 0;
        let arr = this.allDatas.data.filter((v) => {
            return v.isSelected === true;
        });

        arr.forEach((v, i) => {
            money += v.price * v.count;
        });
        return money;
    }


}

export default new RootStore();