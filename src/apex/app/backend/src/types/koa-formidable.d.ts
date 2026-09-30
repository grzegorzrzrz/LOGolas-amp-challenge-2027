declare module 'koa-formidable' {
    import { Request } from 'koa';

    interface FormidableRequest extends Request {
        files?: {
            [key: string]: {
                filepath: string;
                originalFilename?: string;
            };
        };
        fields?: {
            [key: string]: string;
        };
    }

    function formidable(): (request: Request) => FormidableRequest;
    export default formidable;
} 