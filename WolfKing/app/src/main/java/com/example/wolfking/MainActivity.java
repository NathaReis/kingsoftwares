package com.example.wolfking;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Vibrator;
import android.provider.Settings;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.Toast;

import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public class MainActivity extends AppCompatActivity {
    BluetoothConnectionService mBluetoothConnection;
    private static final int PERMISSION_REQUEST_CODE = 1001;
    private static final String TAG = "MainActivity";
    private static final UUID MY_UUID_INSECURE = UUID.fromString("52afa797-e093-4bde-801c-7708a8d0b547");
    BluetoothDevice mBTDevice;
    BluetoothAdapter mBluetoothAdapter;
    private Handler mHandler = new Handler();
    Button btnONOFF, btnVisible, btnDiscover, btnStartConnection;
    RecyclerView recyclerView;
    public ArrayList<BluetoothDevice> mBTDevices = new ArrayList<>();
    List<Item> items;

    //Vibrate
    private Vibrator vibrator;
    int timeShort = 100;
    int timeLong = 400;
    int pause = 500;
    int pressedTime = 0;
    boolean validVibration = true;
    String listClicks = "";

    //Notification
//    private static final String CHANNEL_ID = "kingwolf";
//    private static final CharSequence CHANNEL_NAME = "King Wolf";
//    private static final String CHANNEL_DESCRIPTION = "Education";

    private final BroadcastReceiver mBroadcastReceiver1 = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (action.equals(mBluetoothAdapter.ACTION_STATE_CHANGED)) {
                final int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, mBluetoothAdapter.ERROR);

                switch (state) {
                    case BluetoothAdapter.STATE_OFF:
                        Toast.makeText(MainActivity.this, "OFF", Toast.LENGTH_SHORT).show();
                        Log.d(TAG, "onReceiver: State OFF");
                        items = new ArrayList<Item>();
                        renderList();
                        break;
                    case BluetoothAdapter.STATE_TURNING_OFF:
                        Log.d(TAG, "onReceiver: State turning OFF");
                        items = new ArrayList<Item>();
                        renderList();
                        break;
                    case BluetoothAdapter.STATE_ON:
                        Toast.makeText(MainActivity.this, "ON", Toast.LENGTH_SHORT).show();
                        Log.d(TAG, "onReceiver: State ON");
                        break;
                    case BluetoothAdapter.STATE_TURNING_ON:
                        Log.d(TAG, "onReceiver: State turning ON");
                        break;
                }
            }
        }
    };
    // Create a BroadcastReceiver for ACTION_FOUND.
    private final BroadcastReceiver mBroadcastReceiver2 = new BroadcastReceiver() {
        @SuppressLint("MissingPermission")
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();
            if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                if(device.getAddress() != null) {
                    if(device.getName() != null) {
                        addDevice(device);
                    }
                }
            }
        }
    };
    private  final BroadcastReceiver mBroadcastReceiver3 = new BroadcastReceiver() {
        @SuppressLint("MissingPermission")
        @Override
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();
            if(action.equals(BluetoothDevice.ACTION_BOND_STATE_CHANGED)) {
                BluetoothDevice mDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                //3 casos:
                //caso1: bonded already
                if(mDevice.getBondState() == BluetoothDevice.BOND_BONDED) {
                    Log.d(TAG, "BroadcastReceiver: BOND_BONDED");
                    mBTDevice = mDevice;
                }
                //caso2: create a bone
                if(mDevice.getBondState() == BluetoothDevice.BOND_BONDING) {
                    Log.d(TAG, "BroadcastReceiver: BOND_BONDING");
                }
                //caso3: breaking a bond
                if(mDevice.getBondState() == BluetoothDevice.BOND_NONE) {
                    Log.d(TAG, "BroadcastReceiver: BOND_NONE");
                }
            }
        }
    };
    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterReceiver(mBroadcastReceiver1);
        unregisterReceiver(mBroadcastReceiver2);
        unregisterReceiver(mBroadcastReceiver3);
    }

    @SuppressLint("MissingInflatedId")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        //Check location
        if (ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            //Request location
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, PERMISSION_REQUEST_CODE);
        } else {
            //Check GPS
            checkLocationEnabled();
        }
        //Screen orientation is portrait
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        setContentView(R.layout.activity_main);

        //Variables
        btnONOFF = (Button) findViewById(R.id.btnONOFF);
        btnVisible = (Button) findViewById((R.id.btnVisible));
        btnDiscover = (Button) findViewById(R.id.btnDiscover);
        btnStartConnection = (Button) findViewById(R.id.btnStartConnection);
        recyclerView = (RecyclerView) findViewById(R.id.recyclerView);
        items = new ArrayList<Item>();
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        vibrator = (Vibrator) getSystemService(MainActivity.VIBRATOR_SERVICE);

        LocalBroadcastManager.getInstance(this).registerReceiver(mReceiver, new IntentFilter("incomingMessage"));

        IntentFilter BTIntent = new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED);
        registerReceiver(mBroadcastReceiver1, BTIntent);
        IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
        registerReceiver(mBroadcastReceiver3, filter);

        //Functions
        if (!mBluetoothAdapter.isEnabled()) {
            Log.d(TAG, "enableDisabledBT: enabling BT");
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, 777);
        }//Se o bluetooth estiver desativado
        else {
            enablePaired();
            renderList();
        }
        btnONOFF.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.d(TAG, "onClick: enabling/disabling bluetooth");
                enableDisabledBT();
            }
        });//Start Bluetooth or disable
        btnVisible.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.d(TAG, "onClick: enabling visible device");
                enableVisible();
            }
        });//Start visible
        btnDiscover.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.d(TAG, "onClick: start discovery");
                if (mBluetoothAdapter.isEnabled()) {
                    items = new ArrayList<Item>();
                    enableDiscover();//Discover new
                    mHandler.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            renderList();
                        }
                    }, 2000);//Timeout 2 seconds for render
                } else {
                    Toast.makeText(MainActivity.this, "OFF", Toast.LENGTH_SHORT).show();
                }//If bluetooth is on
            }
        });//Start discovery
        btnStartConnection.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startConnection();
            }
        });//Start connection
    }

    public boolean isBluetoothDeviceValid(BluetoothDevice device) {
        return device != null && device.getAddress() != null && !device.getAddress().isEmpty();
    }

    BroadcastReceiver mReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String text = intent.getStringExtra("theMessage");
            Toast.makeText(MainActivity.this, text, Toast.LENGTH_LONG).show();
            try {
                vibrate(text);
            } catch (NumberFormatException e) {
                Log.e(TAG, "onReceive: Invalid format: " + e.getMessage());
            }
        }
    };// Receive message

    public void startConnection() {
        startBTConnection(mBTDevice, MY_UUID_INSECURE);
    }

    public void startBTConnection(BluetoothDevice device, UUID uuid) {
        if(isBluetoothDeviceValid(device)) {
            Log.d(TAG, "startBTConnection: Initializing RFCOM Bluetooth Connection");
            mBluetoothConnection.startClient(device, uuid);
        } else {
            Toast.makeText(MainActivity.this, "Selecione um dispositivo antes", Toast.LENGTH_SHORT).show();
        }

    }//Connected devices

    public void renderList() {
        recyclerView.setLayoutManager(new LinearLayoutManager(MainActivity.this));
        MyAdapter adapter = new MyAdapter(getApplicationContext(), items);
        recyclerView.setAdapter(adapter);
        adapter.setOnItemClickListener(new MyAdapter.OnItemClickListener() {
            @SuppressLint("MissingPermission")
            @Override
            public void onItemClick(Item item) {
                int positionItem = items.indexOf(item);
                pairDevice(positionItem);
            }
        });//Click no item da lista
    }//Renderizar a lista confome a variável items

    @SuppressLint("MissingPermission")
    private void pairDevice(int position) {
        if (mBluetoothAdapter.isDiscovering()) {
            mBluetoothAdapter.cancelDiscovery();
        }//Cancelar descoberta se ativada

        Toast.makeText(MainActivity.this, "Carregando: " + items.get(position).getName(), Toast.LENGTH_SHORT).show();
        if (Build.VERSION.SDK_INT > Build.VERSION_CODES.JELLY_BEAN_MR2) {
            mBTDevices.get(position).createBond();
            Log.d(TAG, "pairDevice: Create Bond");
            mBTDevice = mBTDevices.get(position);
            mBluetoothConnection = new BluetoothConnectionService(MainActivity.this);
        }
    }

    @SuppressLint("MissingPermission")
    public void enableDisabledBT() {
        if (mBluetoothAdapter == null) {
            Toast.makeText(MainActivity.this, "Does not have BT capabilities", Toast.LENGTH_SHORT).show();
            Log.d(TAG, "enableDisableBT: Does not have BT capabilities");
        }//Se não ter suport para bluetooth

        if (!mBluetoothAdapter.isEnabled()) {
            Log.d(TAG, "enableDisabledBT: enabling BT");
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, 777);
        }//Se o bluetooth estiver desativado

        if (mBluetoothAdapter.isEnabled()) {
            Log.d(TAG, "enableDisabledBT: disabling BT");
            mBluetoothAdapter.disable();
        }//Se o bluetooth estiver ativado

    }//Ativando e desativando o bluetooth

    @SuppressLint("MissingPermission")
    public void enableVisible() {
        int requestCode = 1;
        Intent discoverableIntent =
                new Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);
        discoverableIntent.putExtra(BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION, 300);
        startActivityForResult(discoverableIntent, requestCode);
    }//Ativando a visibilidade

    @SuppressLint("MissingPermission")
    public void addDevice(BluetoothDevice device) {
        items.add(new Item(device.getName(), device.getAddress()));
        mBTDevices.add(device);
    }

    public void enablePaired() {
        @SuppressLint("MissingPermission")
        Set<BluetoothDevice> pairedDevices = mBluetoothAdapter.getBondedDevices();
        if (pairedDevices.size() > 0) {
            for (BluetoothDevice device : pairedDevices) {
                addDevice(device);
            }
        }
    }//Buscando dispositivos já pareados

    public void enableDiscover() {
        if (ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, PERMISSION_REQUEST_CODE);
        }//Permissão requisitada

        if (mBluetoothAdapter.isDiscovering()) {
            mBluetoothAdapter.cancelDiscovery();
        }//Cancelar descoberta se ativada

        if (!mBluetoothAdapter.isDiscovering()) {
            mBluetoothAdapter.startDiscovery();
            IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
            registerReceiver(mBroadcastReceiver2, filter);
        }//Iniciar descoberta
    }//Buscando dispositivos não pareados

    //Location

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permissão de localização concedida, verificar se o GPS está ativado
                checkLocationEnabled();
            }
        }
    }

    private void checkLocationEnabled() {
        LocationManager locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        if (!locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
            // O GPS está desativado, abrir configurações de localização
            Intent callGPSSettingIntent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
            startActivity(callGPSSettingIntent);
        }
    }

    //Vibração
    public void vibrate(String repeatStr) {
        if(repeatStr.length() > 8) {
            repeatStr = repeatStr.substring(8);
        }// Controla o click a mais q tem
        String[] repeatStrArray = repeatStr.split(" ");
        long[] repeat = convertStringArrayToLongArray(repeatStrArray);

        // vibrator.vibrate(alert); // Inicia a vibração única
        vibrator.vibrate(repeat, -1);
    }

    public static long[] convertStringArrayToLongArray(String[] stringArray) {
        long[] longArray = new long[stringArray.length];
        for (int i = 0; i < stringArray.length; i++) {
            longArray[i] = Long.parseLong(stringArray[i]);
        }
        return longArray;
    }

    public void resetCountAndPressedTime() {
        pressedTime = 0;
        validVibration = false;
        listClicks = "";
    }
    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        pressedTime = 0;

        if (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_HEADSETHOOK) {
            validVibration = true;
            listClicks += pause+ " " + timeShort + " ";
        }
        else if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            validVibration = true;
            listClicks += pause+ " " + timeLong + " ";
        }

        return super.onKeyDown(keyCode, event);
    }

    public void enviarListClicks() {
        byte[] bytes = (listClicks).getBytes(Charset.defaultCharset());
        mBluetoothConnection.write(bytes);
        vibrate(pause + " " + timeShort);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if(keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
            if(validVibration) {
                pressedTime++;
            }

            if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) {

                if(pressedTime > 10) {
                    if(validVibration) {
                        if(isBluetoothDeviceValid(mBTDevice)) {
//                            byte[] bytes = (listClicks).getBytes(Charset.defaultCharset());
//                            mBluetoothConnection.write(bytes);
//                            vibrate(pause + " " + timeShort);
                            vibrate(listClicks);
                        }//If valid device
                    }//If valid vibration
                    resetCountAndPressedTime();
                }//Send message if segurar o botão volume up

            }
            else if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {

                if(pressedTime > 10) {
                    resetCountAndPressedTime();
                }
            }
        }
        else {
            if(validVibration) {
                pressedTime++;
            }

            switch (keyCode) {
                case KeyEvent.KEYCODE_HEADSETHOOK:

                    if(pressedTime > 10) {
                        if(validVibration) {
                            if(isBluetoothDeviceValid(mBTDevice)) {
//                                byte[] bytes = (listClicks).getBytes(Charset.defaultCharset());
//                                mBluetoothConnection.write(bytes);
//                                vibrate(pause + " " + timeShort);
                                vibrate(listClicks);
                            }//If valid device
                        }//If valid vibration
                        resetCountAndPressedTime();
                    }//Send message if segurar o botão volume up
            }
        }


        Log.d(TAG, "onKeyDown: " + pressedTime);
        return super.onKeyDown(keyCode, event);
    }

    // Notification
//    public static void sendNotification(Context context, String title, String message) {
//        // Verifica se o dispositivo está rodando uma versão do Android que requer canais de notificação
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME,
//                    NotificationManager.IMPORTANCE_DEFAULT);
//            channel.setDescription(CHANNEL_DESCRIPTION);
//            NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
//            notificationManager.createNotificationChannel(channel);
//        }
//
//        // Cria a intent para quando a notificação for clicada
//        Intent intent = new Intent(context, MainActivity.class);
//        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
//        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
//
//        // Cria a notificação
//        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
//                .setSmallIcon(R.drawable.baseline_bluetooth_24) // Ícone da notificação
//                .setContentTitle(title) // Título da notificação
//                .setContentText(message) // Conteúdo da notificação
//                .setPriority(NotificationCompat.PRIORITY_DEFAULT) // Prioridade da notificação
//                .setContentIntent(pendingIntent) // Intent a ser executada quando a notificação for clicada
//                .setAutoCancel(true); // Cancela a notificação quando clicada
//
//        // Exibe a notificação
//        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
//        notificationManager.notify(/*ID da notificação*/ 1, builder.build());
//    }
}