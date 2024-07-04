declare module '@tensorflow/tfjs-core/dist/hash_util' {
  export function hexToLong(hex: string): any;
  export function fingerPrint64(s: Uint8Array, len?: number): any;
}

declare module '@tensorflow/tfjs-layers/dist/keras_format/types' {
  export interface PyJson {
    [key: string]: any;
  }

  export interface PyJsonDict {
    [key: string]: PyJson;
  }

  export type PyJsonValue = string | number | boolean | null | PyJson | PyJsonArray;
  export type PyJsonArray = Array<PyJsonValue>;

  export interface ConfigDict {
    [key: string]: PyJsonValue | ConfigDict | ConfigDictArray;
  }

  export type ConfigDictArray = Array<ConfigDict | PyJsonValue>;
}

declare module '@tensorflow/tfjs-layers/dist/keras_format/topology_config' {
  import { Shape } from '@tensorflow/tfjs-core';

  export interface TopologyConfig {
    input_shape?: Shape;
    batch_input_shape?: Shape;
    batch_size?: number;
    dtype?: keyof DataTypeMap;
    name?: string;
    trainable?: boolean;
    input_dtype?: keyof DataTypeMap;
    inbound_nodes?: NodeConfig[];
  }
}

declare module '@tensorflow/tfjs-layers/dist/keras_format/training_config' {
  export interface TrainingConfig {
    metrics?: MetricsIdentifier[] | {
      [key: string]: string;
    };
    weighted_metrics?: MetricsIdentifier[];
    sample_weight_mode?: 'temporal';
    loss_weights?: LossWeights;
  }
}

declare module '@tensorflow/tfjs-layers/dist/layers/core' {
  export interface CoreLayer {
    seed?: number;
  }
}
