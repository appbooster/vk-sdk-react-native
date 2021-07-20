#import "RNVkontakteLoginUtils.h"

@implementation RNVkontakteLoginUtils

+ (UIWindow *)findWindow
{
    UIWindow *window = [UIApplication sharedApplication].keyWindow;
    if (window == nil || window.windowLevel != UIWindowLevelNormal) {
        for (window in [UIApplication sharedApplication].windows) {
            if (window.windowLevel == UIWindowLevelNormal) {
                break;
            }
        }
    }
    return window;
}

+ (UIViewController *)topMostViewController
{
    UIWindow *keyWindow = [self findWindow];
    // SDK expects a key window at this point, if it is not, make it one
    if (keyWindow !=  nil && !keyWindow.isKeyWindow) {
        [keyWindow makeKeyWindow];
    }
    
    UIViewController *topController = keyWindow.rootViewController;
    while (topController.presentedViewController) {
        topController = topController.presentedViewController;
    }
    return topController;
}

@end
