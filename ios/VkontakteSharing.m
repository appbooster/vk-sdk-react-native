#if __has_include(<React/RCTConvert.h>)
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>
#elif __has_include("RCTConvert.h")
#import "RCTConvert.h"
#import "RCTUtils.h"
#else
#import "React/RCTConvert.h" // Required when used as a Pod in a Swift project
#import "React/RCTUtils.h"
#endif

#import "VkontakteSharing.h"
#import "RNVkontakteLoginUtils.h"

#if __has_include(<VKSdkFramework/VKSdkFramework.h>)
#import <VKSdkFramework/VKSdkFramework.h>
#else
#import "VKSdk.h"
#endif

#ifdef DEBUG
#define DMLog(...) NSLog(@"[VKSharing] %s %@", __PRETTY_FUNCTION__, [NSString stringWithFormat:__VA_ARGS__])
#else
#define DMLog(...) do { } while (0)
#endif

@implementation VkontakteSharing

- (void)openShareDlg:(VKShareDialogController *) dialog resolver: (RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject {
  UIViewController *root = [RNVkontakteLoginUtils topMostViewController];
  [dialog setCompletionHandler:^(VKShareDialogController *dialog, VKShareDialogControllerResult result) {
    if (result == VKShareDialogControllerResultDone) {
      DMLog(@"onVkShareComplete");
      resolve(dialog.postId);
      // done
    } else if (result == VKShareDialogControllerResultCancelled) {
      DMLog(@"onVkShareCancel");
      reject(RCTErrorUnspecified, nil, RCTErrorWithMessage(@"canceled"));
    }
      [root dismissViewControllerAnimated:YES completion:nil];
  }];

  [root presentViewController:dialog animated:YES completion:nil];
}

- (VKUploadImage *)getImageForSharing:(NSString *) imagePath {
  NSURL *url = [NSURL URLWithString:[imagePath stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]]];
  UIImage *imageForSharing = [[UIImage alloc] initWithData:[NSData dataWithContentsOfURL:url]];
  return [VKUploadImage uploadImageWithImage:imageForSharing andParams:nil];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(share: (NSDictionary *) data resolver: (RCTPromiseResolveBlock) resolve rejecter:(RCTPromiseRejectBlock) reject) {
  DMLog(@"Open Share Dialog");
  if (![VKSdk initialized]){
    reject(RCTErrorUnspecified, nil, RCTErrorWithMessage(@"VK SDK must be initialized first"));
    return;
  }

  NSString *imagePath = data[@"image"];
  BOOL isImageExists = imagePath != nil && imagePath.length;

  NSMutableArray *permissions = @[VK_PER_WALL];
  if (isImageExists) {
    permissions = [permissions arrayByAddingObject:VK_PER_PHOTOS];
  }
  VKSdk *sdk = [VKSdk instance];
  if (![sdk hasPermissions:permissions]){
    reject(RCTErrorUnspecified, nil, RCTErrorWithMessage(@"Access denied: no access to call this method"));
    return;
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    VKShareDialogController *shareDialog = [VKShareDialogController new];
    shareDialog.text = [RCTConvert NSString:data[@"description"]];
    shareDialog.shareLink = [[VKShareLink alloc] initWithTitle:[RCTConvert NSString:data[@"linkText"]] link:[NSURL URLWithString:[RCTConvert NSString:data[@"linkUrl"]]]];
    if (isImageExists) {
      shareDialog.uploadImages = @[[self getImageForSharing:imagePath]];
    }
    [VKSdk wakeUpSession:permissions completeBlock:^(VKAuthorizationState state, NSError *error) {
      if (state == VKAuthorizationUnknown && [VKSdk accessToken]) {
        [VKSdk forceLogout];
      }
      [self openShareDlg:shareDialog resolver:resolve rejecter:reject];
    }];
  });
}

@end
