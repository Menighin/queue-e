export default class FileSystemUtils {

    static sizeToString(size) {
        if (size < 1000) return '1kb';
        else if (size < 1000000) return `${size / 1000}kb`;
        else return `${size / 1000000}mb`
    }

}