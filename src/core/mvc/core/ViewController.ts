module junyou {

    export interface ViewController {
        /**
         * 面板加入到舞台时执行
         */
        awake?();
        /**
         * 面板从舞台移除时执行
         */
        sleep?();
    }

    /**
     * 可以调用 @d_interest 的视图  
     * 可以进行关注facade中的事件
     * 
     * @export
     * @class ViewController
     * @extends {FHost}
     */
    export class ViewController extends FHost {

        /**
		 * 加载状态
		 */
        protected _ready: boolean;

        /**
         * 关注列表
         */
        protected _interests: { [index: string]: Interest };

        /**
         * 用于内部增加关注
         * 
         * @param {Key} eventType 
         * @param {{ (e?: egret.Event): void }} handler 
         * @param {boolean} [triggerOnStage] 
         * @param {number} [priority] 
         */
        interest(eventType: Key, handler: { (e?: egret.Event): void }, triggerOnStage?: boolean, priority?: number) {
            let ins = <Interest>{};
            ins.handler = handler;
            ins.priority = priority || 0;
            ins.trigger = triggerOnStage;
            this._interests[eventType] = ins;
        }

        removeSkinListener(skin: egret.DisplayObject) {
            if (skin) {
                skin.off(EgretEvent.REMOVED_FROM_STAGE, this.stageHandler, this);
                skin.off(EgretEvent.ADDED_TO_STAGE, this.stageHandler, this);
            }
        }

        addSkinListener(skin: egret.DisplayObject) {
            if (skin) {
                skin.on(EgretEvent.REMOVED_FROM_STAGE, this.stageHandler, this);
                skin.on(EgretEvent.ADDED_TO_STAGE, this.stageHandler, this);
            }
        }

        public get isReady() {
            return this._ready;
        }
        stageHandler(e: egret.Event) {
            let type: string, ins: Interest;
            const _interests = this._interests;
            if (e.type == EgretEvent.ADDED_TO_STAGE) {
                //加入关注的事件
                for (type in _interests) {
                    ins = _interests[type];
                    on(type, ins.handler, this, ins.priority);
                    if (ins.trigger) {
                        ins.handler.call(this);
                    }
                }
                if (this.awake) {
                    this.awake();
                }
            } else {
                for (type in _interests) {
                    ins = _interests[type];
                    off(type, ins.handler, this);
                }
                if (this.sleep) {
                    this.sleep();
                }
            }
        }
    }

    export interface Interest {
        /**
         * 回调函数
         */
        handler: (e?: egret.Event) => void;
        /**
         * 
         * 优先级
         * @type {number}
         */
        priority: number;

        /**
         * 
         * 添加到舞台的时候，立即执行一次回调函数
         * @type {boolean}
         */
        trigger: boolean;
    }
    /**
     * 使用注入的方法
     * 添加关注
     * 关注为事件处理回调，只会在awake时，添加到事件监听列表
     * 在sleep时，从事件监听列表中移除
     * @param {string} type                         关注的事件
     * @param {(e?: Event) => void} handler          回调函数
     * @param {boolean} [triggerOnStage=false]      添加到舞台的时候，会立即执行一次，<font color="#f00">注意，处理回调必须能支持不传event的情况</font>
     * @param {number} [priority=0]                 优先级，默认为0
     */
    export function interest(eventType: string | number, triggerOnStage?: boolean, priority?: number) {
        return function (target: any, key: string, value: any) {
            let _interests = target._interests;
            if (!_interests) {
                target._interests = _interests = {};
            }
            let ins = <Interest>{};
            ins.handler = value.value;
            ins.priority = priority || 0;
            ins.trigger = triggerOnStage;
            _interests[eventType] = ins;
        }
    }
}
module junyou {
    /**
    * 使用@d_interest 注入 添加关注
    * 关注为事件处理回调，只会在awake时，添加到事件监听列表
    * 在sleep时，从事件监听列表中移除
    * @param {string} type                         关注的事件
    * @param {(e?: Event) => void} handler          回调函数
    * @param {boolean} [triggerOnStage=false]      添加到舞台的时候，会立即执行一次，<font color="#f00">注意，处理回调必须能支持不传event的情况</font>
    * @param {number} [priority=0]                 优先级，默认为0
    */
    export var d_interest = interest;
}
