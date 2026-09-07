# Corregir gastos vinculados a tarjetas y facturas

## Objetivo
Garantizar que cualquier gasto creado o editado con una tarjeta de crédito quede vinculado una sola vez y aparezca inmediatamente tanto en el área de tarjetas como en la factura correspondiente.

## Cambios
1. **Vinculación al guardar el gasto**
   - Mantener el identificador real de la tarjeta en la transacción al crearla desde cualquier formulario disponible.
   - Normalizar la opción “Sin tarjeta” para guardar una relación vacía válida, evitando valores que no sean identificadores de tarjeta.
   - Al editar un gasto, actualizar correctamente la relación: quitarlo de la tarjeta anterior y mostrarlo en la nueva sin crear otra transacción.

2. **Sincronización de datos**
   - Hacer que crear o editar una transacción actualice el estado compartido con el registro confirmado por la base de datos.
   - Recalcular automáticamente los importes de cada tarjeta a partir de las transacciones vinculadas, sin duplicar gastos ni depender de una recarga manual.

3. **Área de tarjetas**
   - Incluir todos los gastos vinculados en la información de la tarjeta, tanto pagados como previstos, para que un gasto no desaparezca por su estado.
   - Mantener el cálculo separado por identificador de tarjeta para evitar cruces entre tarjetas con nombres similares.

4. **Factura / extracto**
   - Corregir el intervalo de facturación para que el mes mostrado incluya el ciclo que termina en el día de cierre de ese mes.
   - Mostrar todos los gastos vinculados a la tarjeta dentro del ciclo seleccionado, con fecha, importe y categoría.
   - Actualizar total, lista y gráficos desde el mismo conjunto de transacciones reales.

5. **Validación integral**
   - Probar creación de un gasto con tarjeta y confirmar que aparece en la tarjeta y su factura.
   - Probar gastos pagados y previstos.
   - Probar el cambio de una tarjeta a otra y la eliminación de la relación.
   - Confirmar que cada operación conserva un único registro y que las tarjetas de otros usuarios no son accesibles.

## Detalles técnicos
- La base de datos ya contiene gastos correctamente relacionados mediante `credit_card_id`; la corrección se concentrará en los filtros, los límites del ciclo de facturación y la sincronización del estado del cliente.
- No se crearán tablas nuevas ni copias de transacciones.
