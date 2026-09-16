#include <napi.h>
#include <windows.h>
#include <tlhelp32.h>
#include <string>

// Function to check if Blender is running natively via C++ Windows API
Napi::Boolean IsBlenderRunning(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    bool isRunning = false;

    // Snapshot of all processes
    HANDLE hProcessSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hProcessSnap == INVALID_HANDLE_VALUE) {
        return Napi::Boolean::New(env, false);
    }

    PROCESSENTRY32 pe32;
    pe32.dwSize = sizeof(PROCESSENTRY32);

    if (Process32First(hProcessSnap, &pe32)) {
        do {
            std::string processName(pe32.szExeFile);
            if (processName == "blender.exe") {
                isRunning = true;
                break;
            }
        } while (Process32Next(hProcessSnap, &pe32));
    }

    CloseHandle(hProcessSnap);
    return Napi::Boolean::New(env, isRunning);
}

// Native initialization
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "isBlenderRunning"),
                Napi::Function::New(env, IsBlenderRunning));
    return exports;
}

NODE_API_MODULE(rgamer_native, Init)
