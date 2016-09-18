declare module "fast-image-size" {
    interface ImageInfo {
        width: number;
        height: number;
        type: string;
    }

    function sizeOf(path: string): ImageInfo;
    function sizeOf(path: string, callback: (err: Error, dimensions: ImageInfo) => void): void;

    namespace sizeOf { }

    export = sizeOf;
}
